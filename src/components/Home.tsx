import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, Flame, Loader2, Mic, RefreshCw } from 'lucide-react';
import { HeroStage } from './HeroStage';
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

// 상황 풀 50종 — 새로고침할 때마다 이 중 6개가 골라져 보인다.
const has = (s: Song, ...words: string[]) => words.some((w) => s.title.includes(w) || s.singer.includes(w));
const anyMood = (s: Song, ...moods: string[]) => moods.some((m) => s.moods.includes(m as never));

const SITUATIONS: Situation[] = [
  { key: 'solo', emoji: '🎧', label: '혼코노', desc: '혼자서 감성 터뜨리기', match: (s) => anyMood(s, 's') },
  { key: 'friends', emoji: '🙌', label: '친구들이랑', desc: '다 같이 신나게', match: (s) => anyMood(s, 'f') },
  { key: 'hype', emoji: '🔥', label: '떼창·분위기 UP', desc: '마이크 놓기 금지', match: (s) => anyMood(s, 'h') },
  { key: 'date', emoji: '💗', label: '썸·데이트', desc: '설렘 충전', match: (s) => anyMood(s, 'd') },
  { key: 'high', emoji: '😤', label: '고음 해소', desc: '스트레스 삭제', match: (s) => anyMood(s, 'g') },
  { key: 'party', emoji: '🍻', label: '회식·가족', desc: '세대 통합', match: (s) => anyMood(s, 'p') },
  { key: 'rain', emoji: '🌧️', label: '비 오는 날', desc: '창밖 보며 발라드', match: (s) => s.genre === 'ballad' && s.vocal >= 3 },
  { key: 'dawn', emoji: '🌙', label: '새벽 이별 감성', desc: '조용히 젖어드는 밤', match: (s) => (s.genre === 'ballad' || s.genre === 'rnb') && s.heat >= 65 },
  { key: 'burst', emoji: '💥', label: '텐션 폭발 댄스', desc: '일어나서 춤추기', match: (s) => s.genre === 'dance' && s.heat >= 70 },
  { key: 'rap', emoji: '🎤', label: '힙합·랩 부시기', desc: '박자에 몸 맡기기', match: (s) => s.genre === 'hiphop' },
  { key: 'drive', emoji: '🚗', label: '드라이브 명곡', desc: '창문 열고 달리기', match: (s) => ['rock', 'indie', 'oldpop'].includes(s.genre) },
  { key: 'old', emoji: '📻', label: '추억의 올드송', desc: '그 시절 그 노래', match: (s) => s.era <= 2000 },
  { key: 'high5', emoji: '🗻', label: '고음 지옥 도전', desc: '오늘 한 번 질러 보기', match: (s) => s.vocal >= 5 },
  { key: 'trot', emoji: '🌾', label: '트로트 한 곡', desc: '흥과 멋을 한 번에', match: (s) => s.genre === 'trot' },
  { key: 'idol', emoji: '✨', label: '아이돌 떼창', desc: '요즘 곡 다 같이', match: (s) => s.genre === 'dance' && s.era >= 2010 },
  { key: 'exam', emoji: '🎉', label: '시험 끝난 날', desc: '해방감 폭발', match: (s) => s.heat >= 80 && ['dance', 'rock'].includes(s.genre) },
  { key: 'friday', emoji: '🕺', label: '불금 텐션', desc: '금요일 밤의 에너지', match: (s) => s.genre === 'dance' && s.heat >= 60 },
  { key: 'warmup', emoji: '🎬', label: '첫 곡 워밍업', desc: '목 풀기 좋은 곡', match: (s) => s.vocal <= 3 && s.heat >= 65 },
  { key: 'ending', emoji: '🌌', label: '엔딩 여운곡', desc: '마지막을 장식하는 곡', match: (s) => s.genre === 'ballad' && s.vocal <= 4 },
  { key: 'cyworld', emoji: '💾', label: '싸이월드 감성', desc: '미니홈피 배경음악', match: (s) => s.era >= 2000 && s.era <= 2010 },
  { key: 'mt', emoji: '🏕️', label: '대학 MT 떼창', desc: '다 같이 소리치기', match: (s) => anyMood(s, 'h', 'f') && s.heat >= 70 },
  { key: 'crush', emoji: '💌', label: '짝사랑·고백', desc: '용기 내는 순간', match: (s) => anyMood(s, 'd') && s.genre === 'ballad' },
  { key: 'breakup', emoji: '💔', label: '이별 직후', desc: '한 곡으로 정리하기', match: (s) => s.genre === 'ballad' && s.vocal >= 4 },
  { key: 'summer', emoji: '🏖️', label: '여름 드라이브', desc: '바다로 떠나는 기분', match: (s) => has(s, '여름', '바다', '해변') || s.genre === 'dance' },
  { key: 'winter', emoji: '❄️', label: '겨울 발라드', desc: '눈 내리는 날 감성', match: (s) => has(s, '겨울', '눈', '12월') || (s.genre === 'ballad' && s.era >= 2000) },
  { key: 'band', emoji: '🥁', label: '밴드 붐', desc: '드럼 치며 부르기', match: (s) => s.genre === 'rock' },
  { key: 'rock', emoji: '🤘', label: '록 스피릿', desc: '목 나갈 때까지', match: (s) => s.genre === 'rock' && s.vocal >= 4 },
  { key: 'duet', emoji: '👥', label: '듀엣 느낌', desc: '둘이서 나눠 부르기', match: (s) => has(s, '&', 'Feat', 'Duet') || anyMood(s, 'd') },
  { key: 'falsetto', emoji: '🎯', label: '가성 연습', desc: '후렴 가성 도전', match: (s) => s.vocal >= 4 && s.genre === 'ballad' },
  { key: 'lowvoice', emoji: '🤫', label: '목 아끼는 저음', desc: '조용히 낮게 부르기', match: (s) => s.vocal <= 2 },
  { key: 'second', emoji: '🍶', label: '회식 2차', desc: '분위기 한 번 더', match: (s) => s.genre === 'trot' || anyMood(s, 'p') },
  { key: 'ballad', emoji: '🎹', label: '발라드 감성', desc: '조용히 노래에 잠기기', match: (s) => s.genre === 'ballad' && s.heat >= 70 },
  { key: 'hiparty', emoji: '🎧', label: '힙합 파티', desc: '요즘 힙합 몰아듣기', match: (s) => (s.genre === 'hiphop' || s.genre === 'rnb') && s.era >= 2010 },
  { key: '90s', emoji: '📼', label: '90년대 명곡', desc: '카세트 감성', match: (s) => s.era <= 1990 },
  { key: '2000s', emoji: '💿', label: '2000년대 레전드', desc: '그때 그 노래', match: (s) => s.era === 2000 },
  { key: '2010s', emoji: '🎞️', label: '2010년대 추억', desc: '10년 전 히트곡', match: (s) => s.era === 2010 },
  { key: 'trend', emoji: '🆕', label: '최신곡 트렌드', desc: '요즘 제일 핫한 곡', match: (s) => s.era >= 2020 },
  { key: 'wedding', emoji: '💍', label: '축가 감성', desc: '설레는 축가 한 곡', match: (s) => anyMood(s, 'd') && s.vocal <= 4 },
  { key: 'stress', emoji: '🎇', label: '스트레스 폭발', desc: '시원하게 지르기', match: (s) => s.vocal >= 4 && s.heat >= 78 },
  { key: 'debut', emoji: '🐣', label: '노래방 첫 데뷔', desc: '부담 없는 입문곡', match: (s) => s.vocal <= 2 && s.heat >= 55 },
  { key: 'drink', emoji: '🍺', label: '술 한잔 감성', desc: '잔 잡고 부르는 곡', match: (s) => anyMood(s, 'p') && s.genre === 'ballad' },
  { key: 'morning', emoji: '☀️', label: '아침 출근길', desc: '기분 좋게 시작', match: (s) => s.heat >= 60 && s.vocal <= 3 },
  { key: 'commute', emoji: '🌆', label: '퇴근길 힐링', desc: '지친 하루 마무리', match: (s) => ['indie', 'rnb', 'ballad'].includes(s.genre) && s.vocal <= 4 },
  { key: 'moodup', emoji: '🔄', label: '기분 전환', desc: '확실하게 텐션 올리기', match: (s) => s.genre === 'dance' && s.heat >= 75 },
  { key: 'ost', emoji: '🎬', label: 'OST 감성', desc: '드라마 속 그 장면', match: (s) => has(s, 'OST', '웹툰') },
  { key: 'addictive', emoji: '🔁', label: '중독성 강한 곡', desc: '한 번 들으면 계속', match: (s) => s.heat >= 85 },
  { key: 'buddyduet', emoji: '🤝', label: '친구랑 듀엣', desc: '둘이 마이크 나눠 잡기', match: (s) => anyMood(s, 'f', 'd') && s.vocal <= 4 },
  { key: 'dawnkono', emoji: '🌃', label: '새벽 코노', desc: '혼자 조용히 한 곡', match: (s) => anyMood(s, 's') && s.genre === 'ballad' },
  { key: 'drunk', emoji: '🍾', label: '만취 떼창', desc: '다 같이 미친 듯이', match: (s) => anyMood(s, 'h') && s.heat >= 70 },
  { key: 'finale', emoji: '🎆', label: '마지막 곡 피날레', desc: '텐션 최고조로 마무리', match: (s) => (s.genre === 'dance' || s.genre === 'rock') && s.heat >= 80 },
];

function shufflePick<T>(list: T[], count: number): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

/** 상황에 맞는 곡을 고르되, 매칭이 적으면 인기곡으로 채워 항상 넉넉하게(8곡 이상) 보여 준다. */
function songsForSituation(situation: Situation): Song[] {
  const primary = SONGS.filter(situation.match).sort((a, b) => b.heat - a.heat);
  const picked = [...primary];
  if (picked.length < 8) {
    for (const song of [...SONGS].sort((a, b) => b.heat - a.heat)) {
      if (picked.length >= 8) break;
      if (!picked.includes(song)) picked.push(song);
    }
  }
  return picked.slice(0, 12);
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
    setOpenSituation({ situation, songs: songsForSituation(situation) });
  };

  return (
    <div className="space-y-6 pb-4">
      <HeroStage onNavigate={onNavigate} />

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
