// /api/lyrics — 공개 가사 DB(LRCLIB) 프록시
//
// 가사를 만들어 내지 않는다. LRCLIB 에 실제로 등록된 가사만 그대로 돌려주고,
// 없으면 lyrics: '' 로 답한다. (화면은 "등록된 가사를 찾지 못했어요" + 네이버 검색 버튼)

const CACHE_TTL = 1000 * 60 * 60 * 12;
const cache = new Map();

async function lrclib(path, timeout = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(`https://lrclib.net/api/${path}`, {
      headers: {
        accept: 'application/json',
        'user-agent': 'SingPick/1.0 (karaoke companion; +https://sing-pick.vercel.app)',
      },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** [00:12.34] 같은 싱크 타임코드를 걷어 내고 순수 가사만 남긴다. */
function stripTimestamps(text) {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*\[\d{1,2}:\d{2}(?:[.:]\d{1,3})?\]\s*/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function pickBest(rows, wantArtist) {
  if (!Array.isArray(rows) || !rows.length) return null;
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[\s()[\]{}'",.·:;!?~\-_&+/]/g, '');
  const artist = norm(wantArtist);
  const scored = rows
    .filter((r) => r && (r.plainLyrics || r.syncedLyrics))
    .map((r) => {
      let score = 0;
      if (norm(r.artistName) === artist) score += 5;
      else if (norm(r.artistName).includes(artist) || artist.includes(norm(r.artistName))) score += 3;
      if (r.plainLyrics) score += 1;
      if (!r.instrumental) score += 1;
      return { row: r, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.row ?? null;
}

export default async function handler(req, res) {
  const title = String(req.query?.title ?? '').trim();
  const artist = String(req.query?.artist ?? '').trim();

  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'public, s-maxage=86400, stale-while-revalidate=604800');

  if (!title) {
    res.status(200).json({ lyrics: '', synced: false, source: 'none' });
    return;
  }

  const key = `${title}::${artist}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    res.status(200).json(cached.payload);
    return;
  }

  // 1) 정확 검색(track_name + artist_name) → 2) 일반 검색(q)
  const attempts = [
    `search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`,
    `search?q=${encodeURIComponent(`${title} ${artist}`.trim())}`,
    `search?q=${encodeURIComponent(title)}`,
  ];

  let best = null;
  for (const path of attempts) {
    const rows = await lrclib(path);
    best = pickBest(rows, artist);
    if (best) break;
  }

  const text = best ? stripTimestamps(best.plainLyrics || best.syncedLyrics) : '';
  const payload = text
    ? {
        lyrics: text,
        synced: Boolean(best?.syncedLyrics),
        source: 'lrclib',
        track: best?.trackName ?? title,
        artist: best?.artistName ?? artist,
      }
    : { lyrics: '', synced: false, source: 'none' };

  cache.set(key, { at: Date.now(), payload });
  if (cache.size > 500) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at).slice(0, 100);
    oldest.forEach(([k]) => cache.delete(k));
  }
  res.status(200).json(payload);
}
