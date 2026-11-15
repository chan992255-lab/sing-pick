import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ExternalLink, Loader2, Music2, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import type { Song } from '../data/songs';
import { fetchVideo, type VideoResult } from './SongPlayer';

type Mode = 'mr' | 'original';

const MODES: { key: Mode; label: string }[] = [
  { key: 'mr', label: '반주 MR' },
  { key: 'original', label: '원곡' },
];

export interface KaraokePlayerHandle {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  /** 처음(0초)부터 재생 — 녹음 시작할 때 사용 */
  restart: () => void;
  /**
   * 소리 없이 재생 권한만 미리 열어 둔다 (아이폰 사파리 대비).
   * 사용자가 누른 버튼 안에서 호출해야 효과가 있다.
   */
  prime: () => void;
}

/**
 * 녹음 화면 안의 컴팩트 반주 플레이어.
 *
 * 아이폰 사파리는 마이크를 켜면 재생 중인 유튜브가 멈추거나 소리가 줄어들 수 있다.
 * 그래서 (1) 재생/재개는 항상 사용자가 누른 버튼 안에서 postMessage 로 보내고,
 * (2) 녹음 중에는 화면 위 고정 바에 '반주 켜기' 버튼이 남아 있어 한 번에 다시 틀 수 있다.
 * 유튜브 iframe 은 enablejsapi 로 띄워 playVideo/pauseVideo/seekTo/setVolume 을 보낸다.
 */
export const KaraokePlayer = forwardRef<
  KaraokePlayerHandle,
  { song: Song; live?: boolean; onPlayingChange?: (playing: boolean) => void }
>(function KaraokePlayer({ song, live = false, onPlayingChange }, ref) {
  const [mode, setMode] = useState<Mode>('mr');
  const [data, setData] = useState<VideoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const pendingPlay = useRef(false);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);

  const send = (func: string, args: unknown[] = []) => {
    const win = frameRef.current?.contentWindow;
    if (!win) return false;
    win.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    return true;
  };

  const startMode = (next: Mode) => {
    setMode(next);
    setLoading(true);
    setData(null);
    setPlaying(false);
    frameRef.current = null;
    fetchVideo(song, next)
      .then((result) => setData(result))
      .catch(() => setData({ videoId: null, reason: 'network' }))
      .finally(() => setLoading(false));
  };

  // 곡이 바뀌면 반주(MR)를 미리 불러 둔다 (재생은 사용자가 누를 때)
  useEffect(() => {
    pendingPlay.current = false;
    startMode('mr');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.id]);

  // 유튜브가 보내는 재생 상태를 받아 버튼 표시를 맞춘다
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frame = frameRef.current;
      if (!frame || event.source !== frame.contentWindow) return;
      let payload: unknown = event.data;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }
      const state = (payload as { info?: { playerState?: number } } | null)?.info?.playerState;
      if (typeof state === 'number') setPlaying(state === 1 || state === 3);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const load = (next: Mode) => startMode(next);

  const play = () => {
    if (!data?.videoId) {
      pendingPlay.current = true;
      load(mode);
      return;
    }
    send('setVolume', [volumeRef.current]);
    send('playVideo');
    setPlaying(true);
  };

  const pause = () => {
    send('pauseVideo');
    setPlaying(false);
  };

  const restart = () => {
    if (!data?.videoId) {
      pendingPlay.current = true;
      load(mode);
      return;
    }
    send('setVolume', [volumeRef.current]);
    send('seekTo', [0, true]);
    send('playVideo');
    setPlaying(true);
  };

  // 아이폰은 사용자 제스처 없이 시작한 재생을 막는 경우가 있다.
  // 녹음 버튼을 누른 그 순간에 소리 없이 한 번 재생해 두면, 카운트다운 뒤
  // 자동으로 반주를 시작할 때 막히지 않는다.
  const prime = () => {
    if (!data?.videoId) return;
    send('setVolume', [0]);
    send('playVideo');
    window.setTimeout(() => {
      send('pauseVideo');
      send('seekTo', [0, true]);
      send('setVolume', [volumeRef.current]);
    }, 200);
  };

  const toggle = () => {
    if (playing) pause();
    else play();
  };

  useImperativeHandle(ref, () => ({ play, pause, toggle, restart, prime }));

  useEffect(() => {
    if (data?.videoId) send('setVolume', [volume]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, data?.videoId]);

  const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${song.singer} ${song.title} ${mode === 'original' ? '노래' : '노래방'}`,
  )}`;
  const appleMusic = `https://music.apple.com/kr/search?term=${encodeURIComponent(`${song.singer} ${song.title}`)}`;

  return (
    <section className={`panel p-3 ${live && !playing ? 'ring-1 ring-amber-400/40' : ''}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-[13px] font-extrabold text-white">
          <Music2 size={14} className="text-lime-300" /> 반주
          {playing ? <span className="text-[10px] font-bold text-lime-300">▶ 재생 중</span> : null}
        </h3>
        <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-0.5">
          {MODES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => load(item.key)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                mode === item.key ? 'bg-white/15 text-white' : 'text-zinc-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/40 py-8 text-[12px] text-zinc-400">
          <Loader2 size={14} className="animate-spin" /> 유튜브에서 {mode === 'original' ? '원곡' : '반주'}를 찾는 중…
        </div>
      ) : null}

      {!loading && data?.videoId ? (
        <div className="relative mx-auto aspect-video w-full max-w-[420px] overflow-hidden rounded-xl border border-white/10 bg-black">
          <iframe
            key={`${data.videoId}-${mode}`}
            ref={frameRef}
            title={`${song.title} ${mode === 'original' ? '원곡' : '반주'}`}
            src={`https://www.youtube.com/embed/${data.videoId}?rel=0&playsinline=1&enablejsapi=1&autoplay=0&origin=${encodeURIComponent(
              typeof window === 'undefined' ? '' : window.location.origin,
            )}`}
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
            onLoad={() => {
              send('setVolume', [volumeRef.current]);
              // 상태 메시지를 받기 시작
              frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening' }), '*');
              if (pendingPlay.current) {
                pendingPlay.current = false;
                send('playVideo');
                setPlaying(true);
              }
            }}
          />
        </div>
      ) : null}

      {!loading && data && !data.videoId ? (
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-[11.5px] text-amber-200">
          지금은 유튜브에서 이 곡의 {mode === 'original' ? '원곡' : '반주'} 영상을 찾지 못했어요. 아래 링크로 바로 열어 볼 수 있어요.
        </div>
      ) : null}

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className={`btn flex-1 py-2 text-[12px] ${
            live && !playing
              ? 'animate-pulse bg-amber-400 text-ink-950'
              : playing
                ? 'border border-white/10 bg-white/[0.08] text-white'
                : 'bg-gradient-to-r from-lime-400 to-lime-300 text-ink-950'
          }`}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? '반주 멈춤' : live ? '반주 켜기' : '반주 재생'}
        </button>
        <button type="button" onClick={restart} className="btn-soft shrink-0 px-3 py-2 text-[11.5px]" aria-label="처음부터 재생">
          <RotateCcw size={13} /> 처음부터
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Volume2 size={13} className="shrink-0 text-zinc-400" />
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="반주 볼륨"
          className="w-full accent-lime-400"
        />
        <span className="w-8 shrink-0 text-right font-mono text-[11px] text-zinc-400">{volume}</span>
      </div>

      <p className="mt-2 text-[10.5px] leading-relaxed text-zinc-500">
        이어폰을 끼면 반주가 마이크에 섞이지 않아 채점이 더 정확해요. 유튜브 일부 영상은 저작권 설정으로 앱 안에서 재생되지 않을
        수 있어요.
      </p>

      {(!data?.videoId && !loading) || mode === 'original' ? (
        <div className="mt-2 flex gap-2">
          <a href={youtubeSearch} target="_blank" rel="noreferrer" className="btn-soft flex-1 py-1.5 text-[11px]">
            <ExternalLink size={12} /> 유튜브에서 열기
          </a>
          <a href={appleMusic} target="_blank" rel="noreferrer" className="btn-soft flex-1 py-1.5 text-[11px]">
            <ExternalLink size={12} /> Apple Music 검색
          </a>
        </div>
      ) : null}
    </section>
  );
});
