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
    .map((line) => line.replace(/\[[^\]]*\]/g, '').replace(/<[^>]*>/g, '').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * LRC 싱크 가사를 [{ t: 시작초, text }] 로 바꾼다.
 * 줄 앞 타임코드는 물론 단어별 타임코드(<00:12.34>)가 섞인 형식도 읽는다.
 * 빈 줄(간주)은 화면 흐름을 위해 버린다.
 */
function parseSyncedLines(text) {
  if (!text) return [];
  const stamp = /[\[<](\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?[\]>]/g;
  const out = [];
  for (const raw of String(text).split('\n')) {
    const stamps = [...raw.matchAll(stamp)];
    if (!stamps.length) continue;
    const body = raw.replace(/\[[^\]]*\]/g, '').replace(/<[^>]*>/g, '').trim();
    if (!body) continue;
    const first = stamps[0];
    const min = Number(first[1]);
    const sec = Number(first[2]);
    const frac = first[3] ? Number(`0.${first[3]}`) : 0;
    const t = Math.max(0, min * 60 + sec + frac);
    out.push({ t: Math.round(t * 100) / 100, text: body });
  }
  out.sort((a, b) => a.t - b.t);
  return out.slice(0, 400);
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
      // 녹음 화면에서 소절 하이라이트를 하려면 타임코드가 있는 쪽이 낫다
      if (r.syncedLyrics) {
        score += 2;
        // 소절이 촘촘한(가사가 더 많이 실린) 버전을 살짝 우대
        score += Math.min(2, (r.syncedLyrics.match(/\[/g)?.length ?? 0) / 30);
      }
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
    res.status(200).json({ lyrics: '', synced: false, syncedLines: [], source: 'none' });
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
  const syncedLines = best ? parseSyncedLines(best.syncedLyrics) : [];
  const payload = text
    ? {
        lyrics: text,
        synced: syncedLines.length > 1,
        syncedLines,
        duration: typeof best?.duration === 'number' ? best.duration : null,
        source: 'lrclib',
        track: best?.trackName ?? title,
        artist: best?.artistName ?? artist,
      }
    : { lyrics: '', synced: false, syncedLines: [], source: 'none' };

  cache.set(key, { at: Date.now(), payload });
  if (cache.size > 500) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at).slice(0, 100);
    oldest.forEach(([k]) => cache.delete(k));
  }
  res.status(200).json(payload);
}
