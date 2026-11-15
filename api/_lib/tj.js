// TJ미디어 공식 사이트(www.tjmedia.com) 조회 도우미
//
// 싱픽은 TJ·금영 곡번호를 다룬다. 금영 번호는 공개 노래방 DB(api.manana.kr)에서,
// TJ 번호는 TJ미디어가 실제로 서비스하는 반주곡 검색/차트 페이지에서 가져온다.
// 두 소스 모두 "실시간"이지만 언제든 막히거나 느려질 수 있으므로, 호출부는
// 반드시 내장 DB 폴백과 함께 쓴다.

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const TIMEOUT = 6000;

async function get(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA, accept: 'text/html,application/json;q=0.9,*/*;q=0.8' },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

const strip = (s) =>
  String(s || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * 반주곡 통합검색. 곡번호·곡제목·가수명 모두 검색된다.
 * @returns {Promise<Array<{tj:string,title:string,singer:string}>>}
 */
export async function searchTj(query, { strType = 0, limit = 20 } = {}) {
  const q = String(query || '').replace(/\s+/g, '');
  if (!q) return [];
  const url =
    'https://www.tjmedia.com/song/accompaniment_search?nationType=&strType=' +
    encodeURIComponent(String(strType)) +
    '&searchTxt=' +
    encodeURIComponent(q);
  const html = await get(url);
  const blocks = html.match(/<li>\s*<ul class="grid-container list[^"]*">[\s\S]*?<\/ul>\s*<\/li>/g) || [];
  const out = [];
  for (const block of blocks) {
    // 곡번호 칸은 단일검색에서 <span class='highlight'> 로 감싸이기도 한다.
    const noBox = block.match(/class="num2"[^>]*>([\s\S]*?)<\/span>/);
    const no = noBox ? strip(noBox[1]).match(/(\d{1,6})/) : null;
    if (!no) continue;
    // 곡 정보 줄에서 아이콘 목록(<ul>)을 걷어 낸 뒤, 첫 <p> 가 곡 제목, singer 줄의 <p> 가 가수다.
    const cleaned = block.replace(/<ul>[\s\S]*?<\/ul>/g, ' ');
    const titleM = cleaned.match(/<p class="">([\s\S]*?)<\/p>/) || cleaned.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    const singerM = block.match(/title4 singer">[\s\S]*?<span>([\s\S]*?)<\/span>/);
    const title = titleM ? strip(titleM[1]) : '';
    const singer = singerM ? strip(singerM[1]) : '';
    if (!title) continue;
    out.push({ tj: no[1], title, singer });
    if (out.length >= limit) break;
  }
  // 곡번호(숫자)로만 된 검색어는 통합검색에 안 걸리므로 곡번호 검색(strType=16)으로 한 번 더 시도한다.
  if (!out.length && /^\d{1,6}$/.test(q) && strType !== 16) {
    return searchTj(q, { strType: 16, limit });
  }
  return out;
}

/**
 * TJ미디어 공식 "많이 부른 순위 TOP 100" (/legacy/api/topAndHot100, chartType=TOP)
 * @returns {Promise<Array<{rank:number,tj:string,title:string,singer:string}>>}
 */
export async function fetchTjTop100({ months = 1 } = {}) {
  const end = new Date();
  const start = new Date(end.getTime() - months * 30 * 24 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const body = new URLSearchParams({
    chartType: 'TOP',
    searchStartDate: fmt(start),
    searchEndDate: fmt(end),
    strType: '1',
  });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const res = await fetch('https://www.tjmedia.com/legacy/api/topAndHot100', {
      method: 'POST',
      headers: {
        'user-agent': UA,
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
        accept: 'application/json, text/javascript, */*; q=0.01',
      },
      body,
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const items = json?.resultData?.items ?? [];
    return items
      .map((it) => ({
        rank: Number(it.rank) || 0,
        tj: String(it.pro ?? ''),
        title: String(it.indexTitle ?? '').trim(),
        singer: String(it.indexSong ?? '').trim(),
      }))
      .filter((x) => x.title && x.tj);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * TJ 공식 차트 (hot100 / 올해 인기곡). 차트 페이지는 서버가 HTML로 그려 준다.
 * @param {'hot100'|'hit_song'} type
 */
export async function fetchTjChart(type = 'hot100') {
  const page = type === 'hit_song' ? 'hit_song' : 'hot100';
  const html = await get(`https://www.tjmedia.com/chart/${page}`);
  const blocks = html.match(/<li>\s*<ul class="grid-container list[^"]*">[\s\S]*?<\/ul>\s*<\/li>/g) || [];
  const out = [];
  let rank = 0;
  for (const block of blocks) {
    const no = block.match(/class="num2[^"]*">(\d{1,6})</) || block.match(/<span class="num2[^"]*">(\d{1,6})<\/span>/);
    if (!no) continue;
    const titleM =
      block.match(/ellipsis1">([\s\S]*?)<\/span>/) ||
      block.match(/<li class="grid-item title">[\s\S]*?<span>([\s\S]*?)<\/span>/);
    const singerM =
      block.match(/ellipsis2">([\s\S]*?)<\/span>/) ||
      block.match(/<li class="grid-item[^"]*singer">[\s\S]*?<span>([\s\S]*?)<\/span>/);
    const title = titleM ? strip(titleM[1]) : '';
    const singer = singerM ? strip(singerM[1]) : '';
    if (!title) continue;
    rank += 1;
    out.push({ rank, tj: no[1], title, singer });
  }
  return out;
}
