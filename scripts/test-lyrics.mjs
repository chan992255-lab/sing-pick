// 가사 찾기(api/lyrics.js) 로컬 검증 스크립트
//
// 한국 곡은 LRCLIB 표기가 제각각(영문/한글 가수명, 괄호 부제, 꼬리표)이라
// 제목·가수 변형을 얼마나 잘 찾아내는지 실제 네트워크로 확인한다.
// 네트워크가 없으면 건너뛴 것으로 표시하고, 없는 곡은 반드시 none 이어야 한다.
//
// 사용법: node scripts/test-lyrics.mjs

import handler from '../api/lyrics.js';

function makeRes() {
  return {
    statusCode: 0,
    body: null,
    setHeader() {},
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

const cases = [
  // [제목, 가수, 기대: 'found' | 'none']
  ['천상연', '이창섭', 'found'],
  ['밤편지', '아이유', 'found'],
  ['사건의 지평선', '윤하', 'found'],
  ['한 페이지가 될 수 있게', '데이식스', 'found'],
  ['Hype Boy', '뉴진스', 'found'],
  ['Super Shy', 'NewJeans', 'found'],
  ['밤편지 (Through the Night)', 'IU', 'found'],
  ['사랑은 늘 도망가 (Inst.)', '임영웅', 'found'],
  ['그중에 그대를 만나', '이선희', 'found'],
  ['취중고백', '김민석', 'found'],
  ['첫 만남은 계획대로 되지 않아', 'TWS', 'found'],
  ['zzz없는곡명zzz', '없는가수zzz', 'none'],
];

let failures = 0;
let networkDown = 0;
const rows = [];

for (const [title, artist, expect] of cases) {
  const res = makeRes();
  const started = Date.now();
  await handler({ query: { title, artist } }, res);
  const ms = Date.now() - started;
  const body = res.body ?? {};
  const found = Boolean(body.lyrics);
  let status = 'ok';
  if (expect === 'found' && !found) {
    // 네트워크 문제인지 구분: 아무것도 못 찾고 응답도 빠르면 조회 실패로 본다
    status = 'MISS';
    failures += 1;
  }
  if (expect === 'none' && found) {
    status = 'WRONG (없는 곡인데 찾음)';
    failures += 1;
  }
  if (!body.syncedLines && expect === 'found' && found) status = 'ok (일반 가사만)';
  rows.push({
    title,
    artist,
    found,
    lines: (body.syncedLines ?? []).length,
    duration: body.duration ?? null,
    track: body.track ?? '',
    source: body.source ?? 'none',
    ms,
    status,
  });
}

const pad = (s, n) => {
  // 한글은 두 칸으로 세어 표를 맞춘다
  const width = [...String(s)].reduce((acc, ch) => acc + (/[ㄱ-힣]/.test(ch) ? 2 : 1), 0);
  return String(s) + ' '.repeat(Math.max(0, n - width));
};

console.log(
  `${pad('제목', 30)}${pad('가수', 12)}${pad('가사', 6)}${pad('싱크줄', 8)}${pad('응답', 8)}상태`,
);
for (const row of rows) {
  console.log(
    `${pad(row.title, 30)}${pad(row.artist, 12)}${pad(row.found ? 'O' : '-', 6)}${pad(row.lines || '-', 8)}${pad(
      `${row.ms}ms`,
      8,
    )}${row.status}`,
  );
}

const networkErrors = rows.filter((row) => !row.found && row.ms < 60).length;
if (networkErrors === rows.length) networkDown += 1;

if (networkDown) {
  console.log('\nLRCLIB 에 접속하지 못해 검사를 건너뛰었습니다.');
  process.exit(0);
}

if (failures) {
  console.log(`\n${failures}건 실패 — 위 목록의 MISS/없는 곡을 확인하세요.`);
  process.exit(1);
}
console.log('\n가사 찾기 검사 통과 ✅');
