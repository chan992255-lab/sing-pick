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

/**
 * 녹음 중 25Hz 로 모은 목소리 분석 프레임.
 * 채점(lib/score.ts)이 이 값만 보고 10개 항목 점수를 계산한다.
 * 마이크 신호를 그대로 분석한 값이며, 원곡과 대조한 것이 아니다.
 */
export interface AudioFrame {
  /** 녹음 시작 기준 초 (일시정지 시간 제외) */
  t: number;
  /** RMS 음량 0~1 */
  rms: number;
  /** 순간 피크 0~1 */
  peak: number;
  /** 영교차율 0~0.5 */
  zcr: number;
  /** 스펙트럼 무게중심(Hz) — 음색의 밝기 */
  centroid: number;
  /** 대역별 에너지 비율 (저역 <200Hz / 중역 / 고역 >2kHz) */
  low: number;
  mid: number;
  high: number;
  /** 직전 프레임 대비 스펙트럼 변화량 0~1 */
  flux: number;
  /** 기본주파수(Hz). 못 찾으면 0 */
  pitch: number;
  /** 피치 신뢰도 0~1 */
  pitchConf: number;
  /** 가장 가까운 반음에서 벗어난 센트(-50~50). pitch 없으면 0 */
  tuning: number;
}

export interface TakeResult {
  blob: Blob;
  duration: number;
  mime: string;
  /** 녹음 중 수집한 분석 프레임 (채점용) */
  frames: AudioFrame[];
  sampleRate: number;
}

/** 반음 기준으로 잰 음정 오차(센트). +면 높고 -면 낮다. */
function centsOffPitch(hz: number): number {
  const midi = 69 + 12 * Math.log2(hz / 440);
  const nearest = Math.round(midi);
  return Math.max(-50, Math.min(50, (midi - nearest) * 100));
}

/**
 * 자기상관(autocorrelation)으로 기본주파수를 찾는다. 70~1000Hz 사람 목소리 범위.
 * 잡음이면 신뢰도가 낮게 나오므로 채점에서 걸러 쓴다.
 */
function detectPitch(buf: Float32Array, sampleRate: number): { pitch: number; conf: number } {
  const n = buf.length;
  let energy = 0;
  for (let i = 0; i < n; i += 1) energy += buf[i] * buf[i];
  if (energy < n * 0.00004) return { pitch: 0, conf: 0 };

  const minLag = Math.max(2, Math.floor(sampleRate / 1000));
  const maxLag = Math.min(n - 2, Math.floor(sampleRate / 70));
  let bestLag = 0;
  let bestVal = 0;
  const corr = new Float32Array(maxLag + 2);
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let sum = 0;
    for (let i = 0; i < n - lag; i += 1) sum += buf[i] * buf[i + lag];
    const v = sum / (n - lag);
    corr[lag] = v;
    if (v > bestVal) {
      bestVal = v;
      bestLag = lag;
    }
  }
  if (!bestLag || bestVal <= 0) return { pitch: 0, conf: 0 };

  // 이웃 lag 와 포물선 보간으로 ±0.5 샘플 정밀도
  const y0 = corr[bestLag - 1] ?? bestVal;
  const y2 = corr[bestLag + 1] ?? bestVal;
  const denom = y0 - 2 * bestVal + y2;
  const shift = denom !== 0 ? (0.5 * (y0 - y2)) / denom : 0;
  const lag = bestLag + Math.max(-0.5, Math.min(0.5, shift));
  const pitch = sampleRate / lag;
  if (!Number.isFinite(pitch) || pitch < 65 || pitch > 1100) return { pitch: 0, conf: 0 };

  const conf = Math.max(0, Math.min(1, bestVal / (energy / n)));
  return { pitch, conf };
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
  const framesRef = useRef<AudioFrame[]>([]);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const countdownTimer = useRef<number | null>(null);
  const startedAt = useRef(0);
  const recordingRef = useRef(false);
  const pausedRef = useRef(false);
  const pauseStartedAt = useRef(0);
  const pausedTotal = useRef(0);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  /** 일시정지 시간을 뺀 실제 녹음 경과 초. 가사 싱크와 채점이 같은 시간축을 쓴다. */
  const elapsedSec = useCallback(() => {
    if (!startedAt.current) return 0;
    const now = Date.now();
    const extra = pausedRef.current ? now - pauseStartedAt.current : 0;
    return Math.max(0, (now - startedAt.current - pausedTotal.current - extra) / 1000);
  }, []);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    if (countdownTimer.current) window.clearInterval(countdownTimer.current);
    countdownTimer.current = null;
    recordingRef.current = false;
    pausedRef.current = false;
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

      // 입력 레벨 미터 + 채점용 분석 프레임 수집
      const wave = new Float32Array(analyser.fftSize);
      const freq = new Uint8Array(analyser.frequencyBinCount);
      const prevMag = new Float32Array(analyser.frequencyBinCount);
      const binHz = ctx.sampleRate / 2 / analyser.frequencyBinCount;
      let lastFrameAt = 0;
      let frameIndex = 0;
      let pitchCarry = { pitch: 0, conf: 0, tuning: 0 };

      const tick = () => {
        analyser.getFloatTimeDomainData(wave);
        let sum = 0;
        let peak = 0;
        for (let i = 0; i < wave.length; i += 1) {
          const v = wave[i];
          sum += v * v;
          const a = v < 0 ? -v : v;
          if (a > peak) peak = a;
        }
        setLevel(Math.min(1, Math.sqrt(sum / wave.length) * 3.2));

        // 녹음 중일 때만 25Hz 로 분석 프레임을 남긴다 (채점·가사 싱크용)
        if (recordingRef.current && !pausedRef.current) {
          const now = Date.now();
          if (now - lastFrameAt >= 40) {
            lastFrameAt = now;
            const rms = Math.sqrt(sum / wave.length);
            let zc = 0;
            for (let i = 1; i < wave.length; i += 1) {
              if (wave[i - 1] >= 0 !== wave[i] >= 0) zc += 1;
            }

            analyser.getByteFrequencyData(freq);
            let magSum = 0;
            let weighted = 0;
            let low = 0;
            let mid = 0;
            let high = 0;
            let flux = 0;
            for (let i = 0; i < freq.length; i += 1) {
              const m = freq[i] / 255;
              const hz = i * binHz;
              magSum += m;
              weighted += m * hz;
              if (hz < 200) low += m;
              else if (hz < 2000) mid += m;
              else high += m;
              const d = m - prevMag[i];
              if (d > 0) flux += d;
              prevMag[i] = m;
            }
            const bandTotal = low + mid + high || 1;

            // 피치는 무거우니 두 프레임에 한 번(약 12.5Hz)
            frameIndex += 1;
            if (frameIndex % 2 === 1 && rms > 0.004) {
              const p = detectPitch(wave, ctx.sampleRate);
              pitchCarry = {
                pitch: p.pitch,
                conf: p.conf,
                tuning: p.pitch ? centsOffPitch(p.pitch) : 0,
              };
            }

            framesRef.current.push({
              t: elapsedSec(),
              rms,
              peak,
              zcr: zc / wave.length,
              centroid: magSum > 0 ? weighted / magSum : 0,
              low: low / bandTotal,
              mid: mid / bandTotal,
              high: high / bandTotal,
              flux: Math.min(1, flux / freq.length),
              pitch: pitchCarry.pitch,
              pitchConf: pitchCarry.conf,
              tuning: pitchCarry.tuning,
            });
          }
        }

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
        const duration = elapsedSec();
        setResult({
          blob,
          duration,
          mime: recorder.mimeType || mime || 'audio/webm',
          frames: framesRef.current.slice(),
          sampleRate: ctx.sampleRate,
        });
        setState('idle');
        setElapsed(0);
        setLevel(0);
        cleanup();
      };

      const begin = () => {
        startedAt.current = Date.now();
        pausedTotal.current = 0;
        pausedRef.current = false;
        framesRef.current = [];
        recordingRef.current = true;
        recorder.start(250);
        setState('recording');
        setElapsed(0);
        timerRef.current = window.setInterval(() => {
          setElapsed(elapsedSec());
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
      pausedRef.current = true;
      pauseStartedAt.current = Date.now();
      setState('paused');
    }
  }, []);

  const resume = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder?.state === 'paused') {
      recorder.resume();
      if (pausedRef.current) {
        pausedTotal.current += Date.now() - pauseStartedAt.current;
        pausedRef.current = false;
      }
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
