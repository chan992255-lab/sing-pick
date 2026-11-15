// 싱픽 내장 곡 DB 빌더
//
// scripts/songs.source.mjs 에 손으로 고른 인기곡 목록을 두고,
// 공개 노래방 DB(api.manana.kr)에서 실제 TJ·금영 곡번호를 찾아
// src/data/songs.ts 와 api/_lib/fallback.json 을 만들어 낸다.
// (곡번호를 손으로 적지 않기 위한 장치 — 잘못된 번호가 앱에 들어가지 않는다.)

import { writeFile, mkdir } from 'node:fs/promises';
import { SONGS, AGE_CHARTS } from './songs.source.mjs';
import { searchTj } from '../api/_lib/tj.js';

const BRAND = { tj: 'TJ', kumyoung: 'KY' };
const ALIAS = {
  아이유: 'iu',
  방탄소년단: 'bts',
  소녀시대: 'girlsgeneration',
  에스파: 'aespa',
  뉴진스: 'newjeans',
  르세라핌: 'lesserafim',
  데이식스: 'day6',
  버즈: 'buzz',
  빅뱅: 'bigbang',
  트와이스: 'twice',
  아이브: 'ive',
  엑소: 'exo',
  세븐틴: 'seventeen',
  있지: 'itzy',
  여자아이들: 'gidle',
  '(여자)아이들': 'gidle',
  레드벨벳: 'redvelvet',
  태연: 'taeyeon',
  젝스키스: 'sechskies',
  에이케이엠유: 'akmu',
  악뮤: 'akmu',
  'akmu': 'akmu',
  비비: 'bibi',
  다이나믹듀오: 'dynamicduo',
  '다이나믹 듀오': 'dynamicduo',
  딘: 'dean',
  비와이: 'bewhy',
  브라운아이즈: 'browneyes',
  '브라운 아이즈': 'browneyes',
  씨엔블루: 'cnblue',
  'ft아일랜드': 'ftisland',
  서태지와아이들: 'seotaijiandboys',
  djdoc: 'djdoc',
  'dj doc': 'djdoc',
  sg워너비: 'sgwannabe',
  'sg 워너비': 'sgwannabe',
  '10cm': '10cm',
  마크툽: 'maktub',
  윤하: 'younha',
  스트레이키즈: 'straykids',
  '스트레이 키즈': 'straykids',
  쿨: 'cool',
  송가인: 'songgain',
  임재현: 'limjaehyun',
  박재정: 'parkjaejung',
  김민석: 'kimminseok',
  이창섭: 'leechangsub',
  엠씨더맥스: 'mcthemax',
  잔나비: 'jannabi',
  김현철: 'kimhyuncheol',
  양요섭: 'yangyoseob',
  서인국: 'seoinguk',
  김종서: 'kimjongseo',
  김추자: 'kimchuja',
};

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
    .replace(/[\s.'"`·,:;!?~\-_&+]/g, '')
    .trim();

const singerKey = (s) => {
  const n = norm(s);
  return ALIAS[n] || n;
};

const singerMatch = (a, b) => {
  const x = singerKey(a);
  const y = singerKey(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (x.length >= 2 && y.includes(x)) return true;
  if (y.length >= 2 && x.includes(y)) return true;
  return false;
};

const titleMatch = (want, got) => {
  const w = norm(want);
  const g = norm(got);
  if (!w || !g) return false;
  if (w === g) return true;
  if (g.startsWith(w) || w.startsWith(g)) return true;
  return g.includes(w);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchTitle(title) {
  const q = title.replace(/\s+/g, '');
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(`https://api.manana.kr/karaoke/song/${encodeURIComponent(q)}.json`, {
        headers: { accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === 2) {
        console.warn(`  ! ${title} 조회 실패: ${err.message}`);
        return [];
      }
      await sleep(400 * (attempt + 1));
    }
  }
  return [];
}

const rows = [];
const misses = [];
let cursor = 0;

async function worker(entry) {
  const [title, singer, genre, moods, era, vocal, heat] = entry;
  const list = await fetchTitle(title);
  const scored = list
    .filter((r) => BRAND[r.brand])
    .filter((r) => titleMatch(title, r.title))
    .map((r) => {
      const exactTitle = norm(r.title) === norm(title);
      const sm = singerMatch(singer, r.singer);
      const score = (exactTitle ? 4 : 2) + (sm ? 4 : 0) + (norm(r.title).startsWith(norm(title)) ? 1 : 0);
      return { ...r, score, sm, exactTitle };
    })
    .sort((a, b) => b.score - a.score);

  // 가수까지 일치하는 결과만 믿는다. (다른 가수의 커버곡 번호를 붙이면 안 되므로)
  const pick = (brand) => {
    const strong = scored.filter((r) => r.brand === brand && r.sm);
    return strong[0] || null;
  };
  const tj = pick('tj');
  const ky = pick('kumyoung');

  if (!tj && !ky) {
    misses.push({ title, singer, reason: list.length ? '제목 불일치' : '결과 없음' });
    // 번호를 못 찾아도 곡 자체는 남긴다. 아래 TJ 공식 검색 패스에서 TJ 번호를 채운다.
    rows.push({ title, singer, tj: '', ky: '', tjTitle: '', kyTitle: '', genre, moods, era, vocal, heat });
    return;
  }
  const weak = (!tj || !ky) ? `${!tj ? 'TJ ' : ''}${!ky ? 'KY' : ''} 없음`.trim() : null;
  if (weak) {
    misses.push({ title, singer, reason: weak, tj: tj?.title, ky: ky?.title, tjSinger: tj || ky ? (tj || ky).singer : null });
  }
  rows.push({
    title,
    singer,
    tj: tj ? String(tj.no) : '',
    ky: ky ? String(ky.no) : '',
    tjTitle: tj ? tj.title : '',
    kyTitle: ky ? ky.title : '',
    genre,
    moods,
    era,
    vocal,
    heat,
  });
}

async function run() {
  const queue = [...SONGS];
  const workers = Array.from({ length: 6 }, async () => {
    while (cursor < queue.length) {
      const entry = queue[cursor];
      cursor += 1;
      await worker(entry);
    }
  });
  await Promise.all(workers);
}

const t0 = Date.now();
await run();

// ── TJ 공식 반주곡 검색으로 빈 TJ 번호 채우기 ────────────────────────
console.log('\nTJ 공식 검색으로 빈 번호를 채우는 중…');
for (const row of rows) {
  if (row.tj) continue;
  try {
    const hits = await searchTj(row.title, { limit: 10 });
    const match = hits.find((h) => titleMatch(row.title, h.title) && singerMatch(row.singer, h.singer));
    if (match) {
      row.tj = String(match.tj);
      row.tjTitle = match.title;
      const i = misses.findIndex((m) => m.title === row.title && m.singer === row.singer);
      if (i >= 0) misses.splice(i, 1);
    }
  } catch (err) {
    console.warn(`  ! TJ 검색 실패 ${row.title}: ${err.message}`);
  }
  await sleep(120);
}
console.log(`\n해결 ${rows.length}곡 / 실패 ${misses.length}곡 / ${(Date.now() - t0) / 1000}s`);
if (misses.length) {
  console.log('\n== 사람이 확인할 곡 ==');
  for (const m of misses) console.log(JSON.stringify(m));
}

// 순서는 목록 순서 유지, id 는 제목+가수로 안정 생성
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '');
const used = new Set();
const songs = rows
  .filter((r) => r.tj || r.ky) // 번호가 하나도 없는 곡은 노래방 앱에서 쓸모가 없다
  .map((r) => {
  let id = `${slug(r.singer)}--${slug(r.title)}`;
  if (used.has(id)) id = `${id}-${String(used.size)}`;
  used.add(id);
  return {
    id,
    title: r.title,
    singer: r.singer,
    tj: r.tj,
    ky: r.ky,
    genre: r.genre,
    moods: r.moods.split(/\s+/).filter(Boolean),
    era: r.era,
    vocal: r.vocal,
    heat: r.heat,
  };
});

const ts = `// 자동 생성 파일 — scripts/build-songs.mjs 가 만든다. 직접 고치지 말 것.
// 곡번호는 공개 노래방 DB(api.manana.kr)에서 조회한 실제 TJ·금영 번호다.
export type Mood = 's' | 'f' | 'h' | 'd' | 'g' | 'p';
export type Genre = 'ballad' | 'dance' | 'hiphop' | 'rnb' | 'rock' | 'trot' | 'oldpop' | 'indie';

export interface Song {
  id: string;
  title: string;
  singer: string;
  /** TJ미디어 곡번호 (없으면 빈 문자열) */
  tj: string;
  /** 금영 곡번호 (없으면 빈 문자열) */
  ky: string;
  genre: Genre;
  moods: Mood[];
  era: number;
  /** 고음 난이도 1(편함) ~ 5(고음 지옥) */
  vocal: number;
  /** 인기 가중치 0~100 (싱픽 큐레이션 기준) */
  heat: number;
}

export const SONGS: Song[] = ${JSON.stringify(songs, null, 2)};

export const SONG_BY_ID: Record<string, Song> = Object.fromEntries(SONGS.map((s) => [s.id, s]));
`;
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(new URL('../src/data/songs.ts', import.meta.url), ts);

// 서버리스 함수가 외부 API 실패 시 쓰는 축소 폴백
await mkdir(new URL('../api/_lib/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../api/_lib/fallback.json', import.meta.url),
  JSON.stringify(songs.map((s) => [s.title, s.singer, s.tj, s.ky])),
);
// ── 연령대별 큐레이션 차트 ──────────────────────────────────────────
const byKey = new Map(songs.map((s) => [`${s.singer}::${s.title}`, s]));
const chartOut = {};
for (const [groupId, items] of Object.entries(AGE_CHARTS)) {
  const list = [];
  for (const [title, singer] of items) {
    const s = byKey.get(`${singer}::${title}`);
    if (!s) {
      console.warn(`  ! 차트 ${groupId}: ${singer} - ${title} 가 곡 목록에 없음`);
      continue;
    }
    list.push(s.id);
  }
  chartOut[groupId] = list;
}
const chartTs = `// 자동 생성 파일 — scripts/build-songs.mjs 가 만든다.
// 연령대별 차트 순서(1위부터). 곡 상세는 SONGS 에서 찾는다.
export const AGE_CHART_IDS: Record<string, string[]> = ${JSON.stringify(chartOut, null, 2)};
`;
await writeFile(new URL('../src/data/charts.ts', import.meta.url), chartTs);
console.log('src/data/songs.ts, src/data/charts.ts, api/_lib/fallback.json 생성 완료');
