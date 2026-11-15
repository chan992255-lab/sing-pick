// /api/chart — TJ미디어 공식 인기차트 (HOT100 / 올해 인기곡)
//
// TJ 차트 페이지는 서버가 HTML 로 그려 주기 때문에, 이 함수가 파싱해 JSON 으로 내려준다.
// 차트를 못 가져오면 songs: [] 로 답하고, 앱 화면은 내장 큐레이션 차트로 폴백한다.

import { fetchTjChart } from './_lib/tj.js';

const CACHE_TTL = 1000 * 60 * 5;
const cache = new Map();

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
