import { useState } from 'react';
import { ExternalLink, Loader2, Music2, Play, Youtube } from 'lucide-react';
import type { Song } from '../data/songs';

export interface VideoResult {
  videoId: string | null;
  title?: string;
  channel?: string;
  reason?: string;
  embed?: string;
  watch?: string;
}

type Mode = 'mr' | 'original';

export type { Mode as VideoMode };

const MODES: { key: Mode; label: string; hint: string }[] = [
  { key: 'mr', label: '반주 MR', hint: '노래방 반주에 맞춰 연습' },
  { key: 'original', label: '원곡', hint: '원곡 들으며 가사 확인' },
];

export async function fetchVideo(song: Song, mode: Mode): Promise<VideoResult> {
  const q = `${song.singer} ${song.title}`.trim();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const res = await fetch(`/api/youtube?q=${encodeURIComponent(q)}&mode=${mode}`, { signal: ctrl.signal });
    if (!res.ok) return { videoId: null, reason: 'http-error' };
    return (await res.json()) as VideoResult;
  } catch {
    return { videoId: null, reason: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

/** 곡 상세·스튜디오에서 쓰는 유튜브 미니 플레이어 (반주 / 원곡) */
export function SongPlayer({ song, compact = false }: { song: Song; compact?: boolean }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [state, setState] = useState<{ loading: boolean; data: VideoResult | null }>({ loading: false, data: null });

  const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${song.singer} ${song.title} ${mode === 'original' ? '노래' : '노래방'}`,
  )}`;
  const appleMusic = `https://music.apple.com/kr/search?term=${encodeURIComponent(`${song.singer} ${song.title}`)}`;

  const start = async (next: Mode) => {
    if (mode === next && state.data?.videoId) return;
    setMode(next);
    setState({ loading: true, data: null });
    const data = await fetchVideo(song, next);
    setState({ loading: false, data });
  };

  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.03] ${compact ? 'p-3' : 'p-4'}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[13.5px] font-extrabold text-white">노래 듣기</h3>
        <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-0.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => void start(m.key)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                mode === m.key ? 'bg-white/15 text-white' : 'text-zinc-400'
              }`}
            >
              {m.key === 'mr' ? <Music2 size={11} /> : <Play size={11} />}
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {mode === null ? (
        <p className="muted">반주(MR)나 원곡을 골라 유튜브 영상으로 바로 들으면서 가사와 녹음을 함께 쓸 수 있어요.</p>
      ) : null}

      {state.loading ? (
        <div className="flex items-center gap-2 py-6 text-[12.5px] text-zinc-400">
          <Loader2 size={14} className="animate-spin" /> 유튜브에서 {mode === 'mr' ? '반주' : '원곡'}를 찾는 중…
        </div>
      ) : null}

      {!state.loading && state.data?.videoId ? (
        <div>
          <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black pb-[56.25%]">
            <iframe
              key={state.data.videoId}
              title={state.data.title ?? `${song.title} 영상`}
              src={`https://www.youtube.com/embed/${state.data.videoId}?rel=0&playsinline=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full"
            />
          </div>
          {state.data.title ? (
            <p className="mt-1.5 line-clamp-2 text-[11px] text-zinc-500">
              {state.data.title}
              {state.data.channel ? ` · ${state.data.channel}` : ''}
            </p>
          ) : null}
          {state.data.channel && /tj|ziller/i.test(state.data.channel) ? (
            <p className="mt-1.5 rounded-lg border border-amber-400/20 bg-amber-400/10 px-2 py-1.5 text-[10.5px] text-amber-200">
              TJ 채널 영상은 앱 안 재생이 막혀 있을 수 있어요. 재생이 안 되면 아래 '유튜브에서 열기'를 눌러 주세요.
            </p>
          ) : null}
        </div>
      ) : null}

      {!state.loading && state.data && !state.data.videoId ? (
        <p className="text-[12.5px] text-zinc-300">
          {state.data.reason === 'not-found'
            ? '유튜브에서 이 곡의 영상을 찾지 못했어요.'
            : '지금은 유튜브 검색이 잠시 막혀 있어요.'}{' '}
          아래 링크로 바로 열어 볼 수 있어요.
        </p>
      ) : null}

      <div className="mt-2 flex gap-2">
        <a href={youtubeSearch} target="_blank" rel="noreferrer" className="btn-soft flex-1 py-2 text-[11.5px]">
          <Youtube size={13} /> 유튜브에서 열기
        </a>
        <a href={appleMusic} target="_blank" rel="noreferrer" className="btn-soft flex-1 py-2 text-[11.5px]">
          <ExternalLink size={13} /> Apple Music 검색
        </a>
      </div>

      {!compact ? (
        <p className="mt-2 text-[10.5px] leading-relaxed text-zinc-500">
          영상은 유튜브에서 제공되며, 일부 영상은 저작권 설정으로 앱 안에서 재생되지 않을 수 있어요. 그때는 '유튜브에서 열기'를
          눌러 주세요.
        </p>
      ) : null}
    </section>
  );
}
