// /api/search — TJ·금영 "전체 곡" 실시간 검색
//
// 브라우저는 외부 노래방 사이트를 직접 부를 수 없으므로(CORS·CSP) 이 함수가 대신 조회한다.
//  1) 공개 노래방 DB(api.manana.kr): 곡 제목으로 TJ·금영 번호를 함께 준다.
//  2) TJ미디어 공식 반주곡 검색: 곡번호·가수명·제목 모두 검색된다.
// 둘을 합쳐 한 곡에 TJ·금영 번호가 같이 붙은 결과를 돌려주고, 둘 다 실패하면
// 저장소에 들어 있는 내장 목록(api/_lib/fallback.json)으로 답한다.

import { readFile } from 'node:fs/promises';
import { searchTj } from './_lib/tj.js';

const MANANA = 'https://api.manana.kr/karaoke/song';
const CACHE_TTL = 1000 * 60 * 10;
const cache = new Map();

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
    .replace(/[\s.'"`·,:;!?~\-_&+]/g, '');

let fallback = null;
async function loadFallback() {
  if (fallback) return fallback;
  try {
    const raw = await readFile(new URL('./_lib/fallback.json', import.meta.url), 'utf8');
    fallback = JSON.parse(raw);
  } catch {
    fallback = [];
  }
  return fallback;
}

async function fetchJson(url, timeout = 4500) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': 'SingPick/1.0 (+https://sing-pick.vercel.app)' },
      signal: ctrl.signal,
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** manana 결과를 곡 단위(제목+가수)로 묶어 TJ·금영 번호를 합친다. */
function groupManana(rows) {
  const groups = [];
  for (const row of rows) {
    if (row.brand !== 'tj' && row.brand !== 'kumyoung') continue;
    const key = `${norm(row.title)}::${norm(row.singer)}`;
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, title: row.title, singer: row.singer, tj: '', ky: '' };
      groups.push(group);
    }
    if (row.brand === 'tj' && !group.tj) group.tj = String(row.no);
    if (row.brand === 'kumyoung' && !group.ky) group.ky = String(row.no);
  }
  return groups;
}

function mergeResults(groups, tjHits, query) {
  const out = [];
  const seen = new Set();
  const nq = norm(query);

  const push = (item) => {
    const key = `${norm(item.title)}::${norm(item.singer)}`;
    if (seen.has(key)) return;
    // 같은 곡인데 TJ·금영 표기가 달라 생긴 중복을 합친다:
    //  · 제목이 같고 가수 앞부분이 비슷하거나
    //  · 가수가 같고 한쪽 제목이 다른 쪽으로 시작하는 경우 (예: "천상연" / "천상연 (웹툰 …)")
    const singerKey = (x) => norm(x).slice(0, 5);
    const near = out.find((o) => {
      if (singerKey(o.singer) !== singerKey(item.singer)) return false;
      const a = norm(o.title);
      const b = norm(item.title);
      if (a === b) return true;
      const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
      return shorter.length >= 2 && longer.startsWith(shorter);
    });
    if (near) {
      near.tj = near.tj || item.tj;
      near.ky = near.ky || item.ky;
      return;
    }
    seen.add(key);
    out.push(item);
  };

  for (const g of groups) push({ ...g, source: 'manana' });

  for (const hit of tjHits) {
    const key = `${norm(hit.title)}::${norm(hit.singer)}`;
    const existing = out.find((o) => o.key === key) || out.find((o) => norm(o.title) === norm(hit.title) && norm(o.singer) === norm(hit.singer));
    if (existing) {
      existing.tj = existing.tj || hit.tj;
      continue;
    }
    push({ key, title: hit.title, singer: hit.singer, tj: hit.tj, ky: '', source: 'tj' });
  }

  // 검색어와 제목이 정확히 같은 곡, 번호로 찾은 곡을 위로 올린다.
  const score = (item) => {
    let s = 0;
    const nt = norm(item.title);
    if (nt === nq) s += 100;
    else if (nt.startsWith(nq)) s += 60;
    else if (nt.includes(nq)) s += 40;
    if (norm(item.singer) === nq) s += 80;
    if (item.tj && item.ky) s += 15;
    return s;
  };
  return out.sort((a, b) => score(b) - score(a));
}

export default async function handler(req, res) {
  const query = String((req.query?.q ?? '')).trim();
  const limit = Math.min(30, Math.max(1, Number(req.query?.limit) || 20));

  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'public, s-maxage=300, stale-while-revalidate=600');

  if (!query) {
    res.status(200).json({ results: [], source: 'none' });
    return;
  }

  const cacheKey = `${query}::${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    res.status(200).json(cached.payload);
    return;
  }

  const compact = query.replace(/\s+/g, '');
  const [mananaRows, tjHits] = await Promise.all([
    fetchJson(`${MANANA}/${encodeURIComponent(compact)}.json`),
    searchTj(query).catch(() => []),
  ]);

  let results = mergeResults(groupManana(Array.isArray(mananaRows) ? mananaRows : []), tjHits, query).slice(0, limit);
  let source = results.length ? 'live' : 'none';

  if (!results.length) {
    // 외부 소스가 모두 막혔을 때: 내장 목록에서 찾아 준다.
    const list = await loadFallback();
    const nq = norm(query);
    results = list
      .filter(([title, singer, tj, ky]) => {
        return (
          norm(title).includes(nq) ||
          norm(singer).includes(nq) ||
          tj === compact ||
          ky === compact
        );
      })
      .slice(0, limit)
      .map(([title, singer, tj, ky]) => ({ title, singer, tj, ky, source: 'builtin' }));
    source = results.length ? 'builtin' : 'none';
  }

  const payload = { query, results, source };
  cache.set(cacheKey, { at: Date.now(), payload });
  if (cache.size > 400) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at).slice(0, 100);
    oldest.forEach(([k]) => cache.delete(k));
  }
  res.status(200).json(payload);
}
