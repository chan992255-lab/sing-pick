import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Loader2, Search as SearchIcon, Sparkles, X } from 'lucide-react';
import { SONGS, type Song } from '../data/songs';
import { hitToSong, searchLive } from '../lib/api';
import { searchLocal, type SearchMode } from '../lib/search';
import { GENRES, MOODS } from '../lib/format';
import { useStore } from '../lib/store';
import { EmptyState, SectionHeader, SongRow } from './ui';

const HOT_KEYWORDS = ['임영웅', '아이유', '에스파', '데이식스', '버즈', '트로트', '고음', '듀엣'];

const MODE_LABELS: { key: SearchMode; label: string }[] = [
  { key: 'all', label: '통합' },
  { key: 'title', label: '곡명' },
  { key: 'singer', label: '가수' },
  { key: 'number', label: '곡번호' },
];

export function SearchView({ onOpenSong }: { onOpenSong: (song: Song) => void }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('all');
  const [genre, setGenre] = useState<string>('all');
  const [mood, setMood] = useState<string>('all');
  const [liveHits, setLiveHits] = useState<Song[]>([]);
  const [liveState, setLiveState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const { recentSongs, rememberRecent } = useStore();

  const base = useMemo(() => {
    let list = SONGS;
    if (genre !== 'all') list = list.filter((s) => s.genre === genre);
    if (mood !== 'all') list = list.filter((s) => s.moods.includes(mood as never));
    return list;
  }, [genre, mood]);

  const local = useMemo(() => searchLocal(base, query, mode), [base, query, mode]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setLiveHits([]);
      setLiveState('idle');
      return undefined;
    }
    let alive = true;
    setLiveState('loading');
    const timer = window.setTimeout(() => {
      searchLive(q)
        .then((hits) => {
          if (!alive) return;
          if (hits === null) {
            setLiveHits([]);
            setLiveState('error');
            return;
          }
          setLiveHits(hits.map((h, i) => hitToSong(h, i)));
          setLiveState('done');
        })
        .catch(() => {
          if (!alive) return;
          setLiveHits([]);
          setLiveState('error');
        });
    }, 320);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const openSong = (song: Song) => {
    rememberRecent(song.id);
    onOpenSong(song);
  };

  const localIds = new Set(local.map((s) => `${s.title}::${s.singer}`));
  const liveOnly = liveHits.filter((s) => !localIds.has(`${s.title}::${s.singer}`));

  return (
    <div className="space-y-4 pb-4">
      <div className="sticky top-0 z-20 -mx-4 bg-ink-950/80 px-4 pb-2 pt-1 backdrop-blur-xl">
        <div className="relative">
          <SearchIcon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="곡명 · 가수 · TJ/금영 곡번호로 검색"
            inputMode="search"
            enterKeyHint="search"
            className="field pl-11 pr-10"
          />
          {query ? (
            <button
              type="button"
              aria-label="지우기"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-zinc-300"
            >
              <X size={13} />
            </button>
          ) : null}
        </div>
        <div className="scroll-x mt-2">
          {MODE_LABELS.map((m) => (
            <button key={m.key} type="button" onClick={() => setMode(m.key)} className={`chip ${mode === m.key ? 'chip-active' : ''}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {!query ? (
        <div className="space-y-5">
          <section>
            <SectionHeader title="이렇게 검색해 보세요" desc="번호만 쳐도 바로 찾아요" />
            <div className="flex flex-wrap gap-2">
              {HOT_KEYWORDS.map((k) => (
                <button key={k} type="button" onClick={() => setQuery(k)} className="chip">
                  {k}
                </button>
              ))}
              <button type="button" onClick={() => setQuery('86059')} className="chip">
                예) 86059
              </button>
            </div>
          </section>

          <section>
            <SectionHeader title="장르" />
            <div className="scroll-x">
              <button type="button" onClick={() => setGenre('all')} className={`chip ${genre === 'all' ? 'chip-active' : ''}`}>
                전체
              </button>
              {GENRES.map((g) => (
                <button key={g.key} type="button" onClick={() => setGenre(g.key)} className={`chip ${genre === g.key ? 'chip-active' : ''}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="상황" />
            <div className="scroll-x">
              <button type="button" onClick={() => setMood('all')} className={`chip ${mood === 'all' ? 'chip-active' : ''}`}>
                전체
              </button>
              {MOODS.map((m) => (
                <button key={m.key} type="button" onClick={() => setMood(m.key)} className={`chip ${mood === m.key ? 'chip-active' : ''}`}>
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </section>

          {recentSongs.length ? (
            <section>
              <SectionHeader title="최근 본 곡" />
              <div className="panel p-1.5">
                {recentSongs.slice(0, 5).map((s) => (
                  <SongRow key={s.id} song={s} onOpen={openSong} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          <section>
            <SectionHeader
              title="내장 DB 검색 결과"
              desc={`${local.length}곡 · 앱에 담긴 애창곡 큐레이션`}
            />
            {local.length ? (
              <div className="panel p-1.5">
                {local.map((s) => (
                  <SongRow key={s.id} song={s} onOpen={openSong} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<SearchIcon size={22} />}
                title="내장 목록에는 없어요"
                desc="아래 실시간 전체 곡 검색 결과를 확인해 보세요."
              />
            )}
          </section>

          <section>
            <SectionHeader
              title="전체 곡 실시간 검색"
              desc="TJ미디어·금영 전체 수록곡"
              action={
                liveState === 'loading' ? (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <Loader2 size={12} className="animate-spin" /> 찾는 중
                  </span>
                ) : liveState === 'done' ? (
                  <span className="flex items-center gap-1 text-[11px] text-lime-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime-400" /> 연결됨
                  </span>
                ) : null
              }
            />
            {liveState === 'error' ? (
              <div className="flex items-start gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-3 py-2.5 text-[12px] text-amber-200">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>실시간 검색이 잠시 막혀 있어요. 위 내장 DB 결과로 계속 찾아볼 수 있고, 잠시 뒤 다시 검색해 보세요.</span>
              </div>
            ) : null}
            {liveState === 'loading' && !liveOnly.length ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/[0.06]" />
                ))}
              </div>
            ) : null}
            {liveOnly.length ? (
              <div className="panel p-1.5">
                {liveOnly.map((s) => (
                  <SongRow key={s.id} song={s} onOpen={openSong} />
                ))}
              </div>
            ) : null}
            {liveState === 'done' && !liveOnly.length && !local.length ? (
              <EmptyState
                icon={<Sparkles size={22} />}
                title="검색 결과가 없어요"
                desc="곡명을 조금 줄이거나 가수 이름으로 찾아보세요. TJ·금영에 없는 곡일 수도 있어요."
              />
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
