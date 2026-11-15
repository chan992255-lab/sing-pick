// 마이크 녹음 (MediaRecorder + Web Audio API)
//
// 아이폰 사파리·데스크톱 크롬 모두에서 동작하도록 표준 API 만 쓴다.
// - 녹음 신호: 마이크 → 입력 게인 → (에코 경로) → MediaStreamDestination → MediaRecorder
// - 에코: DelayNode + GainNode 피드백 루프로 노래방 느낌을 낸다.
//   스피커로 모니터링하지 않으므로 하울링은 없지만, 이어폰을 권장한다.

import { useCallback, useEffect, useRef, useState } from 'react';

export interface RecorderSettings {
  /** 녹음 시작 전 카운트다운 (초). 0 = 끔 */
  countdown: 0 | 3 | 5;
  echo: boolean;
  /** 에코 강도 0 ~ 1 */
  echoLevel: number;
  /** 마이크 입력 게인 0.5 ~ 2 */
  gain: number;
  quality: 'standard' | 'high';
}

export const DEFAULT_SETTINGS: RecorderSettings = {
  countdown: 3,
  echo: true,
  echoLevel: 0.45,
  gain: 1,
  quality: 'standard',
};

const SETTINGS_KEY = 'singpick.recorder.v1';

export function loadRecorderSettings(): RecorderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<RecorderSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveRecorderSettings(settings: RecorderSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* 무시 */
  }
}

export type RecorderState = 'idle' | 'countdown' | 'recording' | 'paused';
export type RecorderError = 'unsupported' | 'permission' | 'no-device' | 'unknown' | null;

export interface TakeResult {
  blob: Blob;
  duration: number;
  mime: string;
}

function pickMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/aac',
  ];
  if (typeof MediaRecorder === 'undefined') return '';
  return candidates.find((t) => MediaRecorder.isTypeSupported?.(t)) ?? '';
}

export function useRecorder(settings: RecorderSettings) {
  const [state, setState] = useState<RecorderState>('idle');
  const [level, setLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<RecorderError>(null);
  const [countdown, setCountdown] = useState(0);
  const [result, setResult] = useState<TakeResult | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const countdownTimer = useRef<number | null>(null);
  const startedAt = useRef(0);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    if (countdownTimer.current) window.clearInterval(countdownTimer.current);
    countdownTimer.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      void ctxRef.current.close().catch(() => undefined);
    }
    ctxRef.current = null;
    recorderRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async () => {
    setError(null);
    setResult(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();

      const s = settingsRef.current;
      const source = ctx.createMediaStreamSource(stream);
      const inputGain = ctx.createGain();
      inputGain.gain.value = s.gain;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;

      const dest = ctx.createMediaStreamDestination();

      source.connect(inputGain);
      inputGain.connect(analyser);
      inputGain.connect(dest); // 마른 소리(dry)

      if (s.echo) {
        const delay = ctx.createDelay(1);
        delay.delayTime.value = 0.23;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.32 * s.echoLevel;
        const wet = ctx.createGain();
        wet.gain.value = 0.55 * s.echoLevel;
        inputGain.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(wet);
        wet.connect(dest);
      }

      // 입력 레벨 미터
      const data = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 3.2));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      const mime = pickMimeType();
      const recorder = new MediaRecorder(dest.stream, {
        ...(mime ? { mimeType: mime } : {}),
        audioBitsPerSecond: s.quality === 'high' ? 192_000 : 96_000,
      });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mime || 'audio/webm' });
        const duration = (Date.now() - startedAt.current) / 1000;
        setResult({ blob, duration, mime: recorder.mimeType || mime || 'audio/webm' });
        setState('idle');
        setElapsed(0);
        setLevel(0);
        cleanup();
      };

      const begin = () => {
        startedAt.current = Date.now();
        recorder.start(250);
        setState('recording');
        setElapsed(0);
        timerRef.current = window.setInterval(() => {
          setElapsed((Date.now() - startedAt.current) / 1000);
        }, 200);
      };

      const countdownSeconds = settingsRef.current.countdown;
      if (countdownSeconds > 0) {
        setState('countdown');
        setCountdown(countdownSeconds);
        countdownTimer.current = window.setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (countdownTimer.current) window.clearInterval(countdownTimer.current);
              countdownTimer.current = null;
              begin();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        begin();
      }
    } catch (err) {
      cleanup();
      setState('idle');
      const name = (err as { name?: string })?.name ?? '';
      if (name === 'NotAllowedError' || name === 'SecurityError') setError('permission');
      else if (name === 'NotFoundError' || name === 'OverconstrainedError') setError('no-device');
      else setError('unknown');
    }
  }, [cleanup]);

  const stop = useCallback(() => {
    if (countdownTimer.current) {
      window.clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    if (state === 'countdown') {
      // 카운트다운 중 취소
      setState('idle');
      setCountdown(0);
      cleanup();
      return;
    }
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      cleanup();
      setState('idle');
    }
  }, [cleanup, state]);

  const pause = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder?.state === 'recording') {
      recorder.pause();
      setState('paused');
    }
  }, []);

  const resume = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder?.state === 'paused') {
      recorder.resume();
      setState('recording');
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setElapsed(0);
    setLevel(0);
    setState('idle');
  }, []);

  return { state, level, elapsed, error, countdown, result, start, stop, pause, resume, reset };
}
