import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Flame, Loader2, Mic, Search, Shuffle, Sparkles, Trophy } from 'lucide-react';
import { SONGS, SONG_BY_ID, type Song } from '../data/songs';
import { AGE_CHART_IDS } from '../data/charts';
import { useStore } from '../lib/store';
import { fetchChart, type ChartHit } from '../lib/api';
import { MOODS, normalize } from '../lib/format';
import { SongRow, SectionHeader, NumberBadge } from './ui';

type ChartTab = 'all' | 'teen' | 'twenty' | 'thirty' | 'forty' | 'fifty' | 'live';

const AGE_TABS: { key: ChartTab; label: string; hint: string }[] = [
  { key: 'live', label: 'TJ 많이 부른 순위 TOP 100', hint: 'TJ미디어 공식 집계 · 가장 많이 불린 곡' },
  { key: 'teen', label: '10대 TOP', hint: '요즘 아이돌·힙합·감성 발라드' },
  { key: 'twenty', label: '20대 TOP', hint: '감성 발라드·역주행 명곡' },
  { key: 'thirty', label: '30대 TOP', hint: '2000~2010년대 레전드' },
  { key: 'forty', label: '40대 TOP', hint: '90년대 가요·록 발라드' },
  { key: 'fifty', label: '50대+ TOP', hint: '트로트·7080 국민가요' },
  { key: 'all', label: '싱픽 전체 TOP', hint: '세대 불문 국민 애창곡' },
];

function matchLocal(title: string, singer: string): Song | undefined {
  const t = normalize(title);
  const s = normalize(singer);
  return (
    SONGS.find((song) => normalize(song.title) === t && normalize(song.singer) === s) ??
    SONGS.find((song) => normalize(song.title) === t) ??
    SONGS.find((song) => t.includes(normalize(song.title)) && s.includes(normalize(song.singer)))
  );
}

function ChartList({
  tab,
  onOpen,
}: {
  tab: ChartTab;
  onOpen: (song: Song) => void;
}) {
  const [live, setLive] = useState<ChartHit[] | null>(null);
  const [loading, setLoading] = useState(tab === 'live');
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (tab !== 'live') return;
    let alive = true;
    setLoading(true);
    setFailed(false);
    fetchChart('top100')
      .then((songs) => {
        if (!alive) return;
        if (songs?.length) setLive(songs);
        else setFailed(true);
      })
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [tab]);

  if (tab === 'live') {
    if (loading) {
      return (
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-6 text-[12.5px] text-zinc-400">
          <Loader2 size={14} className="animate-spin" /> TJ미디어 공식 차트를 불러오는 중…
        </div>
      );
    }
    const rows = live ?? [];
    const fallbackSongs = AGE_CHART_IDS.all.map((id) => SONG_BY_ID[id]).filter(Boolean);
    if (failed || !rows.length) {
      return (
        <div>
          <p className="mb-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-[11.5px] text-amber-200">
            지금은 TJ 공식 차트를 못 불러와서, 싱픽 대표 애창곡으로 대신 보여 드려요.
          </p>
          {fallbackSongs.map((song, i) => (
            <SongRow key={song.id} song={song} rank={i + 1} onOpen={onOpen} />
          ))}
        </div>
      );
    }
    const shown = expanded ? rows : rows.slice(0, 20);
    return (
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-hot-500/25 bg-hot-500/10 px-2.5 py-2">
          <span className="flex items-center gap-1 rounded-full bg-hot-500 px-2 py-0.5 text-[10px] font-black tracking-wide text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE
          </span>
          <span className="text-[11px] font-bold text-hot-200">
            TJ 많이 부른 순위 TOP 100 · 실시간 연동
          </span>
        </div>
        {shown.map((hit) => {
          const local = matchLocal(hit.title, hit.singer);
          const base: Song =
            local ??
            {
              id: `tj-chart-${hit.tj}`,
              title: hit.title,
              singer: hit.singer,
              tj: hit.tj,
              ky: '',
              genre: 'dance',
              moods: [],
              era: 2020,
              vocal: 3,
              heat: 50,
            };
          // TJ 차트의 최신 TJ 번호를 우선하고, 금영 번호는 내장 DB/서버 보강 결과를 쓴다.
          const song: Song = {
            ...base,
            id: `tj-chart-${hit.tj}`,
            title: hit.title,
            singer: hit.singer,
            tj: hit.tj,
            ky: base.ky || hit.ky || '',
          };
          return (
            <div key={`${hit.tj}-${hit.rank}`} onClick={() => onOpen(song)}>
              <SongRow song={song} rank={hit.rank} onOpen={onOpen} />
            </div>
          );
        })}
        {rows.length > 20 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 flex w-full items-center justify-center gap-1 rounded-xl border border-white/10 py-2.5 text-[12px] font-bold text-zinc-300"
          >
            {expanded ? '접기' : `TOP ${rows.length} 전체 보기`} <ChevronDown size={14} className={expanded ? 'rotate-180' : ''} />
          </button>
        ) : null}
      </div>
    );
  }

  const ids = AGE_CHART_IDS[tab] ?? [];
  const songs = ids.map((id) => SONG_BY_ID[id]).filter(Boolean);
  return (
    <div>
      <p className="mb-1 px-2 text-[11px] text-zinc-500">
        싱픽 연령대별 큐레이션 · TJ 노래방 곡번호 기준
      </p>
      {songs.map((song, i) => (
        <SongRow key={song.id} song={song} rank={i + 1} onOpen={onOpen} />
      ))}
    </div>
  );
}

export function Home({
  onOpenSong,
  onNavigate,
}: {
  onOpenSong: (song: Song) => void;
  onNavigate: (route: 'search' | 'roulette' | 'setlist' | 'library' | 'quiz') => void;
}) {
  const [tab, setTab] = useState<ChartTab>('live');
  const { setlistSongs, favoriteSongs } = useStore();

  const moodPicks = useMemo(() => {
    const pick = (mood: string) =>
      SONGS.filter((s) => s.moods.includes(mood as never))
        .sort((a, b) => b.heat - a.heat)
        .slice(0, 5);
    return pick;
  }, []);

  return (
    <div className="space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-neon-600/30 via-ink-850 to-ink-900 p-5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-hot-500/20 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10.5px] font-black tracking-wide text-white/90">
            <Sparkles size={11} /> 대한민국 노래방 필수앱
          </p>
          <h1 className="mt-3 text-[26px] font-black leading-tight tracking-tight text-white text-balance">
            오늘은 <span className="text-lime-300">무슨 노래</span> 부를까?
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-300">
            TJ·금영 곡번호부터 연령대별 인기차트, 랜덤 룰렛, 가사와 녹음까지 한 번에.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => onNavigate('search')} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-left transition active:scale-[0.98]">
              <Search size={17} className="text-lime-300" />
              <p className="mt-2 text-[12px] font-bold text-white">전체 곡 검색</p>
              <p className="text-[10.5px] text-zinc-400">제목·가수·번호</p>
            </button>
            <button type="button" onClick={() => onNavigate('roulette')} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-left transition active:scale-[0.98]">
              <Shuffle size={17} className="text-neon-300" />
              <p className="mt-2 text-[12px] font-bold text-white">랜덤 룰렛</p>
              <p className="text-[10.5px] text-zinc-400">고민 끝</p>
            </button>
            <button type="button" onClick={() => onNavigate('quiz')} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-left transition active:scale-[0.98]">
              <Trophy size={17} className="text-hot-400" />
              <p className="mt-2 text-[12px] font-bold text-white">18번 찾기</p>
              <p className="text-[10.5px] text-zinc-400">7문항 테스트</p>
            </button>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          title="인기 차트"
          desc="연령대별 TOP과 TJ 공식 차트를 한 번에"
          action={
            <button type="button" onClick={() => onNavigate('search')} className="flex items-center gap-0.5 text-[11.5px] font-bold text-zinc-400">
              전체 검색 <ArrowRight size={12} />
            </button>
          }
        />
        <div className="scroll-x mb-2">
          {AGE_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`chip ${tab === t.key ? 'chip-active' : ''}`}
            >
              {t.key === 'live' ? <Flame size={12} className={tab === t.key ? 'text-hot-400' : ''} /> : null}
              {t.label}
            </button>
          ))}
        </div>
        <p className="mb-1 px-2 text-[11px] text-zinc-500">{AGE_TABS.find((t) => t.key === tab)?.hint}</p>
        <div className="panel p-1.5">
          <ChartList tab={tab} onOpen={onOpenSong} />
        </div>
      </section>

      <section>
        <SectionHeader title="상황별 추천" desc="지금 분위기에 딱 맞는 곡" />
        <div className="grid grid-cols-2 gap-2">
          {MOODS.map((mood) => {
            const top = moodPicks(mood.key)[0];
            return (
              <button
                key={mood.key}
                type="button"
                onClick={() => top && onOpenSong(top)}
                className="panel flex flex-col items-start gap-1 p-3 text-left transition active:scale-[0.98]"
              >
                <span className="text-[18px]">{mood.emoji}</span>
                <span className="text-[13px] font-bold text-white">{mood.label}</span>
                <span className="text-[11px] text-zinc-400">{mood.desc}</span>
                {top ? (
                  <span className="mt-1 flex w-full items-center gap-1 truncate rounded-lg bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
                    <span className="truncate">{top.title}</span>
                    <NumberBadge brand="TJ" no={top.tj} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {setlistSongs.length ? (
        <section>
          <SectionHeader
            title="오늘의 셋리스트"
            desc={`${setlistSongs.length}곡 준비됨`}
            action={
              <button type="button" onClick={() => onNavigate('setlist')} className="flex items-center gap-0.5 text-[11.5px] font-bold text-zinc-400">
                보기 <ArrowRight size={12} />
              </button>
            }
          />
          <div className="panel p-1.5">
            {setlistSongs.slice(0, 3).map((song, i) => (
              <SongRow key={song.id} song={song} rank={i + 1} onOpen={onOpenSong} />
            ))}
          </div>
        </section>
      ) : null}

      {favoriteSongs.length ? (
        <section>
          <SectionHeader title="내 애창곡" desc="키·메모와 함께 저장돼 있어요" />
          <div className="panel p-1.5">
            {favoriteSongs.slice(0, 4).map((song) => (
              <SongRow key={song.id} song={song} onOpen={onOpenSong} />
            ))}
          </div>
          <button type="button" onClick={() => onNavigate('library')} className="btn-ghost mt-2 w-full text-[12px]">
            보관함 전체 보기
          </button>
        </section>
      ) : (
        <section className="panel flex items-center gap-3 p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-lime-400/15">
            <Mic size={18} className="text-lime-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white">내 키와 메모, 앱에 저장해 두세요</p>
            <p className="muted">곡을 담아 두면 다음 노래방에서 바로 꺼내 쓸 수 있어요.</p>
          </div>
        </section>
      )}
    </div>
  );
}
