// /api/youtube — 유튜브에서 반주(MR)·원곡 영상을 찾아 준다.
//
// 공식 API 키 없이, 유튜브 검색 결과 HTML 에 들어 있는 초기 데이터에서
// 영상(videoRenderer) 목록을 읽어 첫 번째 재생 가능한 videoId 를 돌려준다.
// 검색이 막히면 videoId 없이 이유를 내려주고, 화면은 유튜브/애플뮤직 링크로 안내한다.

const CACHE_TTL = 1000 * 60 * 60 * 3;
const cache = new Map();

function decode(text) {
  return String(text || '')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/');
}

function pickVideos(html) {
  const out = [];
  const marker = '"videoRenderer":{"videoId":"';
  let idx = html.indexOf(marker);
  while (idx !== -1) {
    const windowText = html.slice(idx, idx + 7000);
    const idMatch = windowText.match(/^"videoRenderer":\{"videoId":"([\w-]{11})"/);
    if (idMatch) {
      const titleM = windowText.match(/"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/);
      const channelM =
        windowText.match(/"longBylineText":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/) ||
        windowText.match(/"ownerText":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/);
      const lengthM = windowText.match(/"lengthText":\{[^}]*?"accessibilityData":\{"label":"([^"]+)"/);
      const isLive = /BADGE_STYLE_TYPE_LIVE_NOW|"isLive":true/.test(windowText);
      if (titleM) {
        const length = lengthM ? lengthM[1] : '';
        const mins = Number((length.match(/(\d+):\d{2}/) || [])[1] || 0);
        out.push({
          videoId: idMatch[1],
          title: decode(titleM[1]),
          channel: channelM ? decode(channelM[1]) : '',
          length,
          isLive,
          minutes: mins,
        });
      }
    }
    idx = html.indexOf(marker, idx + marker.length);
  }
  return out;
}

export default async function handler(req, res) {
  const q = String(req.query?.q ?? '').trim();
  const mode = req.query?.mode === 'original' ? 'original' : 'mr';

  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  if (!q) {
    res.status(200).json({ videoId: null, reason: 'empty-query' });
    return;
  }

  const keyword = mode === 'mr' ? `${q} 노래방 MR` : `${q} 공식 음원`;
  const key = `${keyword}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    res.status(200).json(cached.payload);
    return;
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}&sp=EgIQAQ%253D%253D`;
    const response = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept-language': 'ko-KR,ko;q=0.9,en;q=0.8',
        accept: 'text/html,application/xhtml+xml',
      },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    const videos = pickVideos(html).filter((v) => !v.isLive && (v.minutes === 0 || v.minutes >= 1));
    // TJ미디어·Ziller 채널은 외부 사이트 임베드를 막아 두는 경우가 많아, 다른 채널을 먼저 고른다.
    const embedsBlocked = (v) => /tj|ziller|tjmedia/i.test(v.channel);
    const best = videos.find((v) => !embedsBlocked(v)) || videos[0];
    const payload = best
      ? {
          videoId: best.videoId,
          title: best.title,
          channel: best.channel,
          length: best.length,
          mode,
          keyword,
          embed: `https://www.youtube.com/embed/${best.videoId}?rel=0&playsinline=1`,
          watch: `https://www.youtube.com/watch?v=${best.videoId}`,
        }
      : { videoId: null, reason: 'not-found', keyword };

    if (best) cache.set(key, { at: Date.now(), payload });
    res.status(200).json(payload);
  } catch (err) {
    res.status(200).json({ videoId: null, reason: 'search-failed', keyword, error: String(err?.message || err) });
  }
}
