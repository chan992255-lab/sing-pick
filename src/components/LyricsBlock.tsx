import { useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import type { Song } from '../data/songs';
import { fetchLyrics } from '../lib/api';

export function LyricsBlock({ song, compact = false }: { song: Song; compact?: boolean }) {
  const [state, setState] = useState<{ loading: boolean; text: string; synced: boolean; failed: boolean }>({
    loading: true,
    text: '',
    synced: false,
    failed: false,
  });
  const [big, setBig] = useState(compact);

  useEffect(() => {
    let alive = true;
    setState({ loading: true, text: '', synced: false, failed: false });
    fetchLyrics(song)
      .then((res) => {
        if (!alive) return;
        setState({ loading: false, text: res.lyrics, synced: res.synced, failed: !res.lyrics });
      })
      .catch(() => {
        if (alive) setState({ loading: false, text: '', synced: false, failed: true });
      });
    return () => {
      alive = false;
    };
  }, [song.id, song.singer, song.title]);

  const naver = `https://search.naver.com/search.naver?query=${encodeURIComponent(`${song.singer} ${song.title} 가사`)}`;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[13.5px] font-extrabold text-white">가사</h3>
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-0.5">
          <button
            type="button"
            onClick={() => setBig(false)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${big ? 'text-zinc-400' : 'bg-white/15 text-white'}`}
          >
            보통
          </button>
          <button
            type="button"
            onClick={() => setBig(true)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${big ? 'bg-white/15 text-white' : 'text-zinc-400'}`}
          >
            크게
          </button>
        </div>
      </div>

      {state.loading ? (
        <div className="flex items-center gap-2 py-6 text-[12.5px] text-zinc-400">
          <Loader2 size={14} className="animate-spin" /> 가사를 찾는 중…
        </div>
      ) : state.failed ? (
        <div className="py-2">
          <p className="text-[13px] text-zinc-300">등록된 가사를 찾지 못했어요.</p>
          <p className="muted mt-1">
            공개 가사 DB(LRCLIB)에 이 곡이 아직 없거나 표기가 달라 못 찾았어요. 가사를 지어내지 않고 그대로 알려드릴게요.
          </p>
          <a href={naver} target="_blank" rel="noreferrer" className="btn-soft mt-3 w-full text-[12.5px]">
            <ExternalLink size={14} /> 네이버에서 가사 바로 검색
          </a>
        </div>
      ) : (
        <>
          <div className={`lyrics-body text-zinc-200 ${big ? 'text-[17px]' : 'text-[13.5px]'}`}>{state.text}</div>
          <p className="mt-3 text-[11px] text-zinc-500">
            가사 제공: LRCLIB 공개 API{state.synced ? ' · 싱크 가사 지원' : ''}
          </p>
        </>
      )}
    </section>
  );
}
