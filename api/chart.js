// /api/chart — TJ미디어 공식 인기차트 (HOT100 / 올해 인기곡)
//
// TJ 차트 페이지는 서버가 HTML 로 그려 주기 때문에, 이 함수가 파싱해 JSON 으로 내려준다.
// 차트를 못 가져오면 songs: [] 로 답하고, 앱 화면은 내장 큐레이션 차트로 폴백한다.

import { fetchTjChart } from './_lib/tj.js';

const CACHE_TTL = 1000 * 60 * 5;
const cache = new Map();

const SINGER_ALIAS = {
  우즈: 'woodz',
  woodz: 'woodz',
  아이유: 'iu',
  임영웅: '임영웅',
  악뮤: 'akmu',
  에스파: 'aespa',
  뉴진스: 'newjeans',
};

const singerKey = (s) => {
  const n = norm(s);
  return SINGER_ALIAS[n] || n;
};

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
    .replace(/[\s.'"`·,:;!?~\-_&+]/g, '');

/** TJ 차트에는 TJ 번호만 있다. 같은 곡의 금영 번호를 공개 노래방 DB에서 찾아 붙여 준다. */
async function enrichKy(songs, limit = 12) {
  const head = songs.slice(0, limit);
  await Promise.all(
    head.map(async (song) => {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 2200);
        const res = await fetch(`https://api.manana.kr/karaoke/song/${encodeURIComponent(song.title.replace(/\s+/g, ''))}.json`, {
          headers: { accept: 'application/json' },
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!res.ok) return;
        const rows = await res.json();
        const hit = (Array.isArray(rows) ? rows : [])
          .filter((r) => r.brand === 'kumyoung')
          .find((r) => {
            const t = norm(r.title);
            const want = norm(song.title);
            const a = singerKey(r.singer);
            const b = singerKey(song.singer);
            const singerOk = a === b || a.includes(b.slice(0, 4)) || b.includes(a.slice(0, 4));
            return singerOk && (t === want || t.startsWith(want) || want.startsWith(t));
          });
        if (hit) song.ky = String(hit.no);
      } catch {
        /* 금영 번호를 못 채워도 차트는 그대로 보여 준다 */
      }
    }),
  );
  return songs;
}

export default async function handler(req, res) {
  const type = req.query?.type === 'hit_song' ? 'hit_song' : 'hot100';
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'public, s-maxage=300, stale-while-revalidate=900');

  const cached = cache.get(type);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    res.status(200).json(cached.payload);
    return;
  }

  try {
    const songs = await fetchTjChart(type);
    await enrichKy(songs);
    const payload = {
      type,
      source: songs.length ? 'tj' : 'unavailable',
      fetchedAt: new Date().toISOString(),
      songs: songs.slice(0, 100),
    };
    if (songs.length) cache.set(type, { at: Date.now(), payload });
    res.status(200).json(payload);
  } catch {
    res.status(200).json({ type, source: 'unavailable', songs: [] });
  }
}
