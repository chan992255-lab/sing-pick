import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  Headphones,
  Mic,
  Pause,
  Play,
  Save,
  Sliders,
  Square,
  Trash2,
  Trophy,
  Volume2,
} from 'lucide-react';
import type { Song } from '../data/songs';
import { useStore } from '../lib/store';
import {
  DEFAULT_SETTINGS,
  loadRecorderSettings,
  saveRecorderSettings,
  useRecorder,
  type RecorderSettings,
} from '../lib/recorder';
import { saveRecording } from '../lib/recordings';
import { scoreTake } from '../lib/score';
import { useLyrics } from '../lib/lyrics';
import { formatDuration } from '../lib/format';
import { LyricsStage } from './LyricsStage';
import { ScoreCard } from './ScoreCard';
import { SongPlayer } from './SongPlayer';
import { Sheet } from './ui';

function LevelMeter({ level }: { level: number }) {
  const bars = 24;
  const active = Math.round(level * bars);
  return (
    <div className="flex h-8 items-end justify-center gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => {
        const on = i < active;
        const color = i > bars * 0.82 ? 'bg-hot-500' : i > bars * 0.6 ? 'bg-amber-400' : 'bg-lime-400';
        return (
          <span
            key={i}
            className={`w-[5px] rounded-full transition-all ${on ? color : 'bg-white/10'}`}
            style={{ height: `${on ? 30 + Math.sin(i) * 6 + active : 8}%` }}
          />
        );
      })}
    </div>
  );
}

function Toggle({ on, onChange, label, desc }: { on: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 py-2 text-left">
      <span className="min-w-0">
        <span className="block text-[13px] font-bold text-white">{label}</span>
        {desc ? <span className="block text-[11px] text-zinc-500">{desc}</span> : null}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-lime-400' : 'bg-white/15'}`}>
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}

export function StudioView({
  song,
  onBack,
  onOpenSong,
}: {
  song: Song | null;
  onBack: () => void;
  onOpenSong: (song: Song) => void;
}) {
  const [settings, setSettings] = useState<RecorderSettings>(() => loadRecorderSettings());
  const [title, setTitle] = useState(song?.title ?? '자유 녹음');
  const [showSettings, setShowSettings] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [cardOpen, setCardOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const { toast, addFavorite, favorites } = useStore();
  const rec = useRecorder(settings);
  const lyrics = useLyrics(song);

  useEffect(() => {
    saveRecorderSettings(settings);
  }, [settings]);

  useEffect(() => {
    setTitle(song?.title ?? '자유 녹음');
  }, [song?.id, song?.title]);

  const audioUrl = rec.result ? URL.createObjectURL(rec.result.blob) : '';
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // 녹음이 끝나면 마이크 분석 프레임으로 10개 항목 100점 점수표를 만든다
  const report = useMemo(
    () => (rec.result ? scoreTake(rec.result.frames, rec.result.duration, { songDuration: lyrics.songDuration }) : null),
    [rec.result, lyrics.songDuration],
  );

  useEffect(() => {
    if (rec.result) {
      setSaveState('idle');
      setCardOpen(true);
    }
  }, [rec.result]);

  const update = (patch: Partial<RecorderSettings>) => setSettings((prev) => ({ ...prev, ...patch }));

  const save = async () => {
    if (!rec.result) return;
    try {
      await saveRecording({
        id: `rec-${Date.now()}`,
        title: title.trim() || '무제 녹음',
        songId: song?.id,
        singer: song?.singer,
        createdAt: Date.now(),
        duration: rec.result.duration,
        size: rec.result.blob.size,
        mime: rec.result.mime,
        blob: rec.result.blob,
      });
      setSaveState('saved');
      toast('녹음 저장 완료! 보관함 > 녹음에서 들어요 🎧');
    } catch {
      toast('저장에 실패했어요. 저장 공간을 확인해 주세요.');
    }
  };

  const download = () => {
    if (!audioUrl) return;
    const ext = rec.result?.mime.includes('mp4') ? 'm4a' : 'webm';
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${title.trim() || '싱픽 녹음'}.${ext}`;
    a.click();
  };

  const retry = () => {
    setCardOpen(false);
    rec.reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const errorText =
    rec.error === 'unsupported'
      ? '이 브라우저는 녹음을 지원하지 않아요. 최신 iOS 사파리·크롬·엣지에서 열어 주세요.'
      : rec.error === 'permission'
        ? '마이크 권한이 꺼져 있어요. 주소창 왼쪽 자물쇠(또는 iPhone 설정 > Safari > 마이크)에서 허용해 주세요.'
        : rec.error === 'no-device'
          ? '마이크를 찾지 못했어요. 이어폰 마이크나 장치 연결을 확인해 주세요.'
          : rec.error
            ? '녹음을 시작하지 못했어요. 잠시 뒤 다시 시도해 주세요.'
            : null;

  const live = rec.state === 'recording' || rec.state === 'paused';

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="btn-ghost px-2 text-[13px]">
          ← 돌아가기
        </button>
        <button type="button" onClick={() => setShowSettings((v) => !v)} className="btn-soft px-3 py-1.5 text-[12px]">
          <Sliders size={14} /> 녹음 설정
        </button>
      </div>

      {/* 녹음 중에는 가사를 보면서도 바로 멈출 수 있게 위에 붙여 둔다 */}
      {live ? (
        <div className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-ink-950/90 px-4 py-2 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <span className="flex shrink-0 items-center gap-1 text-[10px] font-black tracking-wide text-hot-400">
              <span className={`h-1.5 w-1.5 rounded-full bg-hot-500 ${rec.state === 'recording' ? 'animate-pulse' : ''}`} />
              {rec.state === 'recording' ? 'LIVE' : 'PAUSE'}
            </span>
            <span className="shrink-0 font-mono text-[19px] font-black tabular-nums leading-none text-white">
              {formatDuration(rec.elapsed)}
            </span>
            <div className="min-w-0 flex-1">
              <LevelMeter level={rec.level} />
            </div>
            <button
              type="button"
              onClick={rec.state === 'paused' ? rec.resume : rec.pause}
              aria-label={rec.state === 'paused' ? '이어서 녹음' : '잠깐 멈춤'}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white"
            >
              {rec.state === 'paused' ? <Play size={15} /> : <Pause size={15} />}
            </button>
            <button type="button" onClick={rec.stop} className="btn shrink-0 bg-hot-500 px-3 py-2 text-[12px] text-white">
              <Square size={12} /> 끝내기
            </button>
          </div>
        </div>
      ) : null}

      <div className="panel relative overflow-hidden p-5">
        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-neon-500/20 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-black tracking-wide text-neon-300">녹음 스튜디오</p>
          <h1 className="mt-1 truncate text-[22px] font-black text-white">{song ? song.title : '자유 녹음'}</h1>
          <p className="text-[12.5px] text-zinc-400">{song ? song.singer : '아무 노래나 부르고 저장해 두세요'}</p>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <div className="relative">
            {rec.state === 'recording' ? (
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-hot-500/30" />
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (rec.state === 'idle') {
                  void rec.start();
                  setSaveState('idle');
                  setCardOpen(false);
                } else if (rec.state === 'recording' || rec.state === 'countdown') {
                  rec.stop();
                } else if (rec.state === 'paused') {
                  rec.resume();
                }
              }}
              className={`relative grid h-28 w-28 place-items-center rounded-full text-white shadow-glow transition active:scale-95 ${
                rec.state === 'recording'
                  ? 'bg-gradient-to-br from-hot-500 to-hot-400'
                  : rec.state === 'paused'
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-br from-neon-500 to-neon-600'
              }`}
            >
              {rec.state === 'idle' ? <Mic size={38} /> : rec.state === 'paused' ? <Play size={34} /> : <Square size={30} />}
            </button>
            {rec.state === 'countdown' ? (
              <div className="absolute inset-0 grid place-items-center rounded-full bg-ink-950/80 text-[44px] font-black text-lime-300">
                {rec.countdown}
              </div>
            ) : null}
          </div>

          <p className="mt-3 font-mono text-[26px] font-black tabular-nums text-white">{formatDuration(rec.elapsed)}</p>
          <p className="text-[11.5px] text-zinc-400">
            {rec.state === 'idle'
              ? song
                ? '마이크 버튼을 누르면 가사가 따라오며 녹음이 시작돼요'
                : '마이크 버튼을 누르면 녹음이 시작돼요'
              : rec.state === 'countdown'
                ? '잠시 후 시작합니다'
                : rec.state === 'paused'
                  ? '일시정지됨'
                  : '녹음 중… 끝나면 점수표가 나와요'}
          </p>

          <div className="mt-3 w-full max-w-[280px]">
            <LevelMeter level={rec.level} />
          </div>

          {rec.state === 'recording' ? (
            <button type="button" onClick={rec.pause} className="btn-soft mt-3 px-3 py-1.5 text-[12px]">
              <Pause size={13} /> 잠깐 멈춤
            </button>
          ) : null}
          {rec.state === 'paused' ? (
            <button type="button" onClick={rec.stop} className="btn-soft mt-3 px-3 py-1.5 text-[12px]">
              <Square size={12} /> 녹음 끝내기
            </button>
          ) : null}
        </div>

        {errorText ? (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-[12px] text-amber-200">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{errorText}</span>
          </div>
        ) : null}

        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-[11.5px] text-zinc-400">
          <Headphones size={14} className="mt-0.5 shrink-0 text-neon-300" />
          <span>에코를 켜면 이어폰으로 듣는 게 좋아요. 스피커로 크게 틀면 하울링이 생길 수 있어요.</span>
        </div>
      </div>

      {song ? (
        <LyricsStage song={song} elapsed={rec.elapsed} recording={rec.state === 'recording'} />
      ) : (
        <section className="panel p-4 text-center">
          <p className="text-[12.5px] font-bold text-zinc-200">곡을 골라 들어오면 노래방처럼 가사가 떠요</p>
          <p className="muted mt-1">가사가 흘러가면서 지금 부를 소절을 크게 비춰 줘요.</p>
          <a href="#/search" className="btn-soft mt-2 text-[12px]">
            곡 검색하기
          </a>
        </section>
      )}

      {song ? <SongPlayer song={song} compact /> : null}

      {rec.result ? (
        <div className="panel p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[13px] font-extrabold text-white">방금 녹음</p>
              <p className="muted mt-0.5">
                {formatDuration(rec.result.duration)} · {(rec.result.blob.size / 1024).toFixed(0)}KB ·{' '}
                {rec.result.mime.includes('mp4') ? 'M4A' : 'WebM'}
              </p>
            </div>
            {report ? (
              <button type="button" onClick={() => setCardOpen(true)} className="btn-lime shrink-0 px-3 py-2 text-[12px]">
                <Trophy size={14} /> {report.total}점 점수표
              </button>
            ) : null}
          </div>
          <audio
            ref={audioRef}
            src={audioUrl}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            controls
            className="mt-3 w-full"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="녹음 이름"
            className="field mt-3 text-[13px]"
          />
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button type="button" onClick={save} className={saveState === 'saved' ? 'btn-soft text-[12px]' : 'btn-primary text-[12px]'}>
              {saveState === 'saved' ? <Check size={14} /> : <Save size={14} />} 저장
            </button>
            <button type="button" onClick={download} className="btn-soft text-[12px]">
              <Download size={14} /> 다운로드
            </button>
            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  if (playing) audioRef.current.pause();
                  else void audioRef.current.play();
                }
              }}
              className="btn-soft text-[12px]"
            >
              {playing ? <Pause size={14} /> : <Play size={14} />} 다시 듣기
            </button>
          </div>
          <button type="button" onClick={rec.reset} className="mt-2 flex w-full items-center justify-center gap-1 text-[11.5px] text-zinc-500">
            <Trash2 size={12} /> 지우고 다시 녹음
          </button>
        </div>
      ) : null}

      {showSettings ? (
        <div className="panel space-y-1 p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[13px] font-extrabold text-white">녹음 설정</p>
            <button
              type="button"
              onClick={() => setSettings(DEFAULT_SETTINGS)}
              className="text-[11px] font-bold text-zinc-500 hover:text-white"
            >
              기본값
            </button>
          </div>

          <div className="py-2">
            <span className="label">시작 카운트다운</span>
            <div className="flex gap-1.5 rounded-2xl bg-white/[0.05] p-1">
              {[0, 3, 5].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => update({ countdown: sec as 0 | 3 | 5 })}
                  className={`flex-1 rounded-xl py-2 text-[12.5px] font-bold transition ${
                    settings.countdown === sec ? 'bg-white/15 text-white' : 'text-zinc-400'
                  }`}
                >
                  {sec === 0 ? '끔' : `${sec}초`}
                </button>
              ))}
            </div>
          </div>

          <Toggle on={settings.echo} onChange={(v) => update({ echo: v })} label="노래방 에코" desc="Delay + 피드백으로 노래방 느낌을 더해요" />
          <div className={settings.echo ? 'py-1' : 'pointer-events-none py-1 opacity-40'}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[12px] font-bold text-zinc-300">에코 강도</span>
              <span className="font-mono text-[12px] text-lime-300">{Math.round(settings.echoLevel * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.echoLevel * 100)}
              onChange={(e) => update({ echoLevel: Number(e.target.value) / 100 })}
              className="w-full accent-lime-400"
            />
          </div>

          <div className="py-1">
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[12px] font-bold text-zinc-300">
                <Volume2 size={13} /> 마이크 입력 볼륨
              </span>
              <span className="font-mono text-[12px] text-lime-300">{settings.gain.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={50}
              max={200}
              step={10}
              value={Math.round(settings.gain * 100)}
              onChange={(e) => update({ gain: Number(e.target.value) / 100 })}
              className="w-full accent-neon-400"
            />
          </div>

          <div className="py-2">
            <span className="label">녹음 음질</span>
            <div className="flex gap-1.5 rounded-2xl bg-white/[0.05] p-1">
              {[
                { key: 'standard' as const, label: '표준 (96kbps)' },
                { key: 'high' as const, label: '고음질 (192kbps)' },
              ].map((q) => (
                <button
                  key={q.key}
                  type="button"
                  onClick={() => update({ quality: q.key })}
                  className={`flex-1 rounded-xl py-2 text-[12px] font-bold transition ${
                    settings.quality === q.key ? 'bg-white/15 text-white' : 'text-zinc-400'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <p className="muted mt-2">설정은 이 기기에 자동 저장돼요.</p>
          </div>
        </div>
      ) : null}

      {song ? (
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => (favorites[song.id] ? onOpenSong(song) : addFavorite(song))}
            className="text-[11.5px] font-bold text-zinc-500 hover:text-white"
          >
            {favorites[song.id] ? '곡 상세 보기' : '애창곡 담기'}
          </button>
          <button type="button" onClick={() => (window.location.hash = '/search')} className="text-[11.5px] font-bold text-zinc-500 hover:text-white">
            다른 곡 부르기 →
          </button>
        </div>
      ) : null}

      <Sheet
        open={cardOpen && Boolean(report)}
        onClose={() => setCardOpen(false)}
        title={
          <div>
            <p className="text-[11px] font-black tracking-wide text-lime-300">노래방 점수</p>
            <h2 className="truncate text-[19px] font-black text-white">{song ? song.title : title}</h2>
            <p className="text-[11.5px] text-zinc-400">{song ? song.singer : '자유 녹음'}</p>
          </div>
        }
      >
        {report ? (
          <ScoreCard
            report={report}
            audioUrl={audioUrl}
            title={title.trim() || '자유 녹음'}
            saved={saveState === 'saved'}
            onClose={() => setCardOpen(false)}
            onRetry={retry}
            onSave={save}
            onDownload={download}
          />
        ) : null}
      </Sheet>
    </div>
  );
}
