// /api/lyrics — 공개 가사 DB(LRCLIB) 프록시
//
// 가사를 만들어 내지 않는다. LRCLIB 에 실제로 등록된 가사만 그대로 돌려주고,
// 없으면 lyrics: '' 로 답한다. (화면은 "등록된 가사를 찾지 못했어요" + 네이버 검색 버튼)
//
// 한국 곡은 LRCLIB 표기가 제각각이라(영문/한글 가수명, 괄호 부제, ' - Remastered' 꼬리표)
// 제목·가수를 정규화한 뒤 여러 쿼리를 순서대로 시도하고, 후보 중 가장 잘 맞는 것을 고른다.
// 제목이 맞으면 가수 표기가 달라도(예: 아이유 ↔ IU) 받아들인다.

const CACHE_TTL = 1000 * 60 * 60 * 12;
/** 못 찾은 결과는 짧게만 기억한다 (나중에 LRCLIB 에 올라올 수 있으니) */
const MISS_TTL = 1000 * 60 * 30;
/** 서버리스 함수가 오래 붙잡히지 않도록 전체 조회 시간 상한 */
const TIME_BUDGET = 7500;
const cache = new Map();

async function lrclib(path, timeout = 4000) {
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
  const out = [];
  for (const raw of String(text).split('\n')) {
    const stamps = [...raw.matchAll(/[\[<](\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?[\]>]/g)];
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

/** 비교용 정규화: 소문자, 괄호·feat·꼬리표 제거, 공백/기호 제거 */
function normText(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]|\{[^}]*\}/g, ' ')
    .replace(/\b(feat\.?|ft\.?|featuring)\b[\s\S]*$/, ' ')
    .replace(/\s[-–—:]\s[\s\S]*$/, ' ')
    .replace(/[^0-9a-z가-힣]/g, '');
}

/**
 * 한 문자열이 가질 수 있는 비교 키들.
 * LRCLIB 은 'Meet him among them(그중에 그대를 만나)' 처럼 영문 제목 뒤 괄호에
 * 한글 제목을 넣기도 해서, 괄호 안 내용도 별도 키로 본다.
 */
function keysOf(value) {
  const raw = String(value || '');
  const keys = new Set();
  const base = normText(raw);
  if (base) keys.add(base);
  for (const match of raw.matchAll(/[\(\[]([^\)\]]+)[\)\]]/g)) {
    const inner = normText(match[1]);
    if (inner) keys.add(inner);
  }
  return [...keys];
}

/** 제목 표기 변형들: 원본, 괄호 제거본, 괄호 안 제목, ' - 수식어' 제거본 */
function titleVariants(title) {
  const base = String(title || '').trim();
  const list = [base];
  const noParen = base.replace(/\([^)]*\)|\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();
  if (noParen && noParen !== base) list.push(noParen);
  for (const match of base.matchAll(/[\(\[]([^\)\]]+)[\)\]]/g)) {
    const inner = match[1].trim();
    if (inner) list.push(inner);
  }
  const noDash = base.split(/\s[-–—:]\s/)[0].trim();
  if (noDash) list.push(noDash);
  return [...new Set(list.filter(Boolean))].slice(0, 4);
}

/** 후보 하나가 얼마나 잘 맞는지. 제목이 안 맞으면 -1 (버린다) */
function scoreRow(row, wantTitle, wantArtist) {
  const rowTitleKeys = [row.trackName, row.name, row.albumName].flatMap((v) => keysOf(v));
  const wantTitleKeys = keysOf(wantTitle);
  if (!wantTitleKeys.length) return -1;

  let titleScore = 0;
  if (wantTitleKeys.some((key) => rowTitleKeys.includes(key))) titleScore = 10;
  else if (
    wantTitleKeys.some((key) => key.length >= 4 && rowTitleKeys.some((candidate) => candidate.includes(key) || key.includes(candidate)))
  )
    titleScore = 6;
  if (!titleScore) return -1;

  let score = titleScore;
  const wantArtistKeys = keysOf(wantArtist);
  const rowArtistKeys = keysOf(row.artistName);
  if (wantArtistKeys.length && rowArtistKeys.length) {
    if (wantArtistKeys.some((key) => rowArtistKeys.includes(key))) score += 6;
    else if (
      wantArtistKeys.some((key) => key.length >= 2 && rowArtistKeys.some((candidate) => candidate.includes(key) || key.includes(candidate)))
    )
      score += 4;
    else if (wantArtistKeys.some((key) => rowArtistKeys.some((candidate) => candidate.includes(key.slice(0, 2)))))
      score += 1;
  }
  if (row.syncedLyrics) score += 2 + Math.min(2, (row.syncedLyrics.match(/\[/g)?.length ?? 0) / 40);
  if (row.plainLyrics) score += 1;
  if (!row.instrumental) score += 1;
  return score;
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
  if (cached && Date.now() - cached.at < (cached.payload.lyrics ? CACHE_TTL : MISS_TTL)) {
    res.status(200).json(cached.payload);
    return;
  }

  const started = Date.now();
  const remaining = () => Math.max(1200, TIME_BUDGET - (Date.now() - started));
  const enc = encodeURIComponent;

  const variants = titleVariants(title);
  const attempts = [];
  for (const variant of variants) {
    if (artist) attempts.push(`search?track_name=${enc(variant)}&artist_name=${enc(artist)}`);
  }
  if (artist) attempts.push(`search?q=${enc(`${variants[0]} ${artist}`.trim())}`);
  attempts.push(`search?q=${enc(variants[0])}`);
  for (const variant of variants.slice(1)) attempts.push(`search?q=${enc(variant)}`);

  let best = null;
  let bestScore = 0;
  for (const attempt of [...new Set(attempts)]) {
    if (Date.now() - started > TIME_BUDGET) break;
    const rows = await lrclib(attempt, remaining());
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (!row || (!row.plainLyrics && !row.syncedLyrics)) continue;
      const score = scoreRow(row, title, artist);
      if (score > bestScore) {
        bestScore = score;
        best = row;
      }
    }
    // 제목이 정확히 맞고 가수까지 맞으면 더 볼 필요 없음
    if (bestScore >= 14) break;
  }

  const accepted = bestScore >= 6 ? best : null;
  const text = accepted ? stripTimestamps(accepted.plainLyrics || accepted.syncedLyrics) : '';
  const syncedLines = accepted ? parseSyncedLines(accepted.syncedLyrics) : [];
  const payload = text
    ? {
        lyrics: text,
        synced: syncedLines.length > 1,
        syncedLines,
        duration: typeof accepted?.duration === 'number' ? accepted.duration : null,
        source: 'lrclib',
        track: accepted?.trackName ?? title,
        artist: accepted?.artistName ?? artist,
      }
    : { lyrics: '', synced: false, syncedLines: [], source: 'none' };

  cache.set(key, { at: Date.now(), payload });
  if (cache.size > 500) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at).slice(0, 100);
    oldest.forEach(([k]) => cache.delete(k));
  }
  res.status(200).json(payload);
}
