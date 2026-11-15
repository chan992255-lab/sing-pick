import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, Flame, Loader2, Mic, RefreshCw, Search, Shuffle, Sparkles, Trophy } from 'lucide-react';
import { SONGS, SONG_BY_ID, type Song } from '../data/songs';
import { AGE_CHART_IDS } from '../data/charts';
import { useStore } from '../lib/store';
import { fetchChart, type ChartHit } from '../lib/api';
import { normalize } from '../lib/format';
import { SongRow, SectionHeader, Sheet } from './ui';

type ChartTab = 'all' | 'teen' | 'twenty' | 'thirty' | 'forty' | 'fifty' | 'live';

const AGE_TABS: { key: ChartTab; label: string; hint: string }[] = [
  { key: 'live', label: 'TJ TOP 100', hint: 'TJ미디어 공식 집계 · 가장 많이 불린 순위' },
  { key: 'teen', label: '10대 TOP', hint: '요즘 아이돌·힙합·감성 발라드' },
  { key: 'twenty', label: '20대 TOP', hint: '감성 발라드·역주행 명곡' },
  { key: 'thirty', label: '30대 TOP', hint: '2000~2010년대 레전드' },
  { key: 'forty', label: '40대 TOP', hint: '90년대 가요·록 발라드' },
  { key: 'fifty', label: '50대+ TOP', hint: '트로트·7080 국민가요' },
  { key: 'all', label: '싱픽 전체 TOP', hint: '세대 불문 국민 애창곡' },
];

interface Situation {
  key: string;
  emoji: string;
  label: string;
  desc: string;
  match: (song: Song) => boolean;
}

// 상황 풀 — 새로고침할 때마다 이 중 6개가 골라져 보인다.
const SITUATIONS: Situation[] = [
  { key: 'm-s', emoji: '🎧', label: '혼코노', desc: '혼자서 감성 터뜨리기', match: (s) => s.moods.includes('s') },
  { key: 'm-f', emoji: '🙌', label: '친구들이랑', desc: '다 같이 신나게', match: (s) => s.moods.includes('f') },
  { key: 'm-h', emoji: '🔥', label: '떼창·분위기 UP', desc: '마이크 놓기 금지', match: (s) => s.moods.includes('h') },
  { key: 'm-d', emoji: '💗', label: '썸·데이트', desc: '설렘 충전', match: (s) => s.moods.includes('d') },
  { key: 'm-g', emoji: '😤', label: '고음 해소', desc: '스트레스 삭제', match: (s) => s.moods.includes('g') },
  { key: 'm-p', emoji: '🍻', label: '회식·가족', desc: '세대 통합', match: (s) => s.moods.includes('p') },
  { key: 'rain', emoji: '🌧️', label: '비 오는 날 감성', desc: '창밖 보며 발라드', match: (s) => s.genre === 'ballad' && s.moods.includes('s') },
  { key: 'dawn', emoji: '🌙', label: '새벽 이별 감성', desc: '조용히 젖어드는 밤', match: (s) => (s.genre === 'ballad' || s.genre === 'rnb') && s.vocal >= 3 },
  { key: 'burst', emoji: '💥', label: '텐션 폭발 댄스', desc: '일어나서 춤추기', match: (s) => s.genre === 'dance' && s.heat >= 75 },
  { key: 'rap', emoji: '🎤', label: '힙합·랩 부시기', desc: '박자에 몸 맡기기', match: (s) => s.genre === 'hiphop' || (s.genre === 'rnb' && s.moods.includes('f')) },
  { key: 'drive', emoji: '🚗', label: '드라이브 명곡', desc: '창문 열고 달리기', match: (s) => ['rock', 'indie', 'oldpop'].includes(s.genre) && s.vocal <= 4 },
  { key: 'old', emoji: '📻', label: '추억의 올드송', desc: '그 시절 그 노래', match: (s) => s.era <= 2010 },
  { key: 'high5', emoji: '🗻', label: '고음 지옥 도전', desc: '오늘 한 번 질러 보기', match: (s) => s.vocal >= 5 },
  { key: 'trot', emoji: '🌾', label: '트로트 한 곡', desc: '흥과 멋을 한 번에', match: (s) => s.genre === 'trot' },
  { key: 'idol', emoji: '✨', label: '아이돌 떼창', desc: '요즘 곡 다 같이', match: (s) => s.genre === 'dance' && s.era >= 2010 },
];

function shufflePick<T>(list: T[], count: number): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

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
  const [visible, setVisible] = useState<Situation[]>(() => shufflePick(SITUATIONS, 6));
  const [openSituation, setOpenSituation] = useState<{ situation: Situation; songs: Song[] } | null>(null);
  const { setlistSongs, favoriteSongs } = useStore();

  const openSituationSongs = (situation: Situation) => {
    const songs = SONGS.filter(situation.match)
      .sort((a, b) => b.heat - a.heat)
      .slice(0, 12);
    setOpenSituation({ situation, songs });
  };

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
        <SectionHeader
          title="상황별 추천"
          desc="지금 분위기에 딱 맞는 곡"
          action={
            <button
              type="button"
              onClick={() => setVisible(shufflePick(SITUATIONS, 6))}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11.5px] font-bold text-zinc-300 transition active:scale-95"
            >
              <RefreshCw size={12} /> 새로고침
            </button>
          }
        />
        <div className="grid grid-cols-2 gap-2">
          {visible.map((situation) => (
            <button
              key={situation.key}
              type="button"
              onClick={() => openSituationSongs(situation)}
              className="panel flex flex-col items-start gap-1 p-3 text-left transition active:scale-[0.98]"
            >
              <span className="text-[18px]">{situation.emoji}</span>
              <span className="text-[13px] font-bold text-white">{situation.label}</span>
              <span className="text-[11px] text-zinc-400">{situation.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <Sheet
        open={Boolean(openSituation)}
        onClose={() => setOpenSituation(null)}
        title={
          <div>
            <p className="text-[16px] font-extrabold text-white">
              {openSituation?.situation.emoji} {openSituation?.situation.label}
            </p>
            <p className="text-[12px] text-zinc-400">
              {openSituation?.situation.desc} · 추천 {openSituation?.songs.length}곡
            </p>
          </div>
        }
      >
        <div className="space-y-1">
          {openSituation?.songs.map((song) => (
            <SongRow key={song.id} song={song} onOpen={onOpenSong} />
          ))}
          {openSituation && !openSituation.songs.length ? (
            <p className="muted py-6 text-center">이 상황에 맞는 곡을 아직 못 찾았어요.</p>
          ) : null}
        </div>
      </Sheet>

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
