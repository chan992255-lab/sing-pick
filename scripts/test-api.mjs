// 서버리스 함수를 로컬에서 그대로 호출해 보는 테스트 (Vercel 배포 전 검증용)

function makeRes() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

async function call(handler, query) {
  const res = makeRes();
  const t0 = Date.now();
  await handler({ query }, res);
  const ms = Date.now() - t0;
  return { status: res.statusCode, payload: res.body, ms, headers: res.headers };
}

const cases = [
  ['search', '천상연'],
  ['search', '86059'],
  ['search', '임영웅'],
  ['search', '하입보이'],
  ['search', '존재하지않는곡명zzz'],
  ['chart', 'hot100'],
  ['lyrics', '천상연'],
  ['lyrics', 'zzz 없는 곡'],
];

const mods = {
  search: (await import('../api/search.js')).default,
  chart: (await import('../api/chart.js')).default,
  lyrics: (await import('../api/lyrics.js')).default,
};

for (const [kind, q] of cases) {
  const query = kind === 'search' ? { q } : kind === 'chart' ? { type: q } : { title: q, artist: '이창섭' };
  try {
    const r = await call(mods[kind], query);
    let summary;
    if (kind === 'search') {
      summary = `${r.payload.source} ${r.payload.results.length}건 :: ` +
        r.payload.results.slice(0, 3).map((x) => `${x.title}/${x.singer}(TJ ${x.tj || '-'} KY ${x.ky || '-'})`).join(' | ');
    } else if (kind === 'chart') {
      summary = `${r.payload.source} ${r.payload.songs.length}곡 :: ` +
        r.payload.songs.slice(0, 3).map((x) => `${x.rank}. ${x.title}(${x.tj})`).join(' | ');
    } else {
      summary = `${r.payload.source} ${r.payload.lyrics.length}자 :: ${r.payload.lyrics.slice(0, 40).replace(/\n/g, ' ')}`;
    }
    console.log(`[${kind}] ${q} → ${r.status} (${r.ms}ms) ${summary}`);
  } catch (err) {
    console.log(`[${kind}] ${q} → ERROR ${err.message}`);
  }
}
