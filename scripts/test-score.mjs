// 채점 엔진(lib/score.ts) 로컬 검증 스크립트
//
// 실제 마이크 없이도 채점이 말이 되는지 확인한다. 합성한 분석 프레임(무음, 짧은 녹음,
// 삑~ 한 음만 유지, 멜로디처럼 음정·음량이 움직이는 녹음)을 넣고 10개 항목 합계가
// 총점과 같은지, 점수가 항목당 0~10 범위인지, 노래 같은 입력이 무음보다 높은지 본다.
//
// 사용법: node scripts/test-score.mjs

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

// score.ts 는 타입만 가져오므로 esbuild 로 바로 ESM 번들로 만든다
const outDir = mkdtempSync(path.join(tmpdir(), 'singpick-score-'));
const outFile = path.join(outDir, 'score.mjs');
execFileSync(
  path.join(root, 'node_modules', '.bin', 'esbuild'),
  [path.join(root, 'src', 'lib', 'score.ts'), '--bundle', '--format=esm', '--platform=neutral', `--outfile=${outFile}`],
  { stdio: 'inherit' },
);
const { scoreTake } = await import(`file://${outFile}`);

const SR = 48000;
const semitone = (semi) => 440 * Math.pow(2, (semi - 69) / 12);

// 프레임 하나: t초 시점에 rms 음량, midi 음높이
function frame(t, { rms, midi = null, conf = 0.8, centroid = 1200, high = 0.2, flux = 0.12 }) {
  const hz = midi === null ? 0 : semitone(midi);
  const midiFloat = midi === null ? null : 69 + 12 * Math.log2(hz / 440);
  return {
    t,
    rms,
    peak: Math.min(1, rms * 1.9),
    zcr: 0.05,
    centroid,
    low: 0.25,
    mid: 0.55,
    high,
    flux,
    pitch: hz,
    pitchConf: midi === null ? 0 : conf,
    tuning: midiFloat === null ? 0 : (midiFloat - Math.round(midiFloat)) * 100,
  };
}

/** 25Hz 로 프레임을 만든다. schedule(t) 이 null 이면 그 순간은 침묵 */
function build({ seconds, schedule }) {
  if (seconds <= 0) return [];
  const frames = [];
  let prevRms = 0.004;
  for (let i = 0; i < seconds * 25; i += 1) {
    const t = i / 25;
    const value = schedule(t);
    const rms = value ? value.rms : 0.004;
    // 실제 마이크처럼 음량이 변하면 스펙트럼도 바뀐다
    const flux = Math.min(0.5, Math.abs(rms - prevRms) * 5 + (rms > 0.02 ? 0.08 : 0));
    frames.push(value ? frame(t, { ...value, flux }) : frame(t, { rms, flux }));
    prevRms = rms;
  }
  return frames;
}

const scenarios = [];

// 1) 거의 무음
scenarios.push({
  name: '무음 30초',
  frames: build({ seconds: 30, schedule: () => null }),
  duration: 30,
});

// 2) 너무 짧은 녹음 (2초)
scenarios.push({
  name: '2초만 소리',
  frames: build({ seconds: 2, schedule: (t) => (t < 1.8 ? { rms: 0.12, midi: 60 } : null) }),
  duration: 2,
});

// 3) 한 음만 길게 (삑~)
scenarios.push({
  name: '한 음 30초 유지',
  frames: build({ seconds: 30, schedule: () => ({ rms: 0.1, midi: 62, centroid: 900, high: 0.08 }) }),
  duration: 30,
});

// 4) 노래처럼: 음정이 움직이고 음량도 오르내리고 중간에 숨 고르기
scenarios.push({
  name: '멜로디 75초 + 숨쉬기',
  frames: build({
    seconds: 75,
    schedule: (t) => {
      const phrase = t % 15;
      if (phrase > 13.4) return null; // 숨 고르기
      const step = Math.floor((phrase % 4) * 2); // 2음씩 오르내리기
      const midi = 60 + step + Math.sin(t * 0.9) * 2.2; // 비브라토
      const rms = 0.09 + 0.05 * Math.sin(t * 0.6) + 0.02 * Math.sin(t * 5.1);
      return { rms, midi, centroid: 1500 + 300 * Math.sin(t), high: 0.3 };
    },
  }),
  duration: 75,
});

// 5) 음정이 흔들리는 시끄러운 녹음 (음정 분석이 어려운 경우)
scenarios.push({
  name: '음정 불안 40초',
  frames: build({
    seconds: 40,
    schedule: (t) => ({ rms: 0.08 + 0.03 * Math.sin(t * 3), midi: 60 + Math.sin(t * 11) * 3.5, conf: 0.22, centroid: 3000, high: 0.5 }),
  }),
  duration: 40,
});

let failed = 0;
const rows = [];
for (const scenario of scenarios) {
  const report = scoreTake(scenario.frames, scenario.duration, {});
  const sum = report.items.reduce((acc, item) => acc + item.score, 0);
  const problems = [];
  if (report.items.length !== 10) problems.push(`항목이 ${report.items.length}개`);
  if (sum !== report.total) problems.push(`합계 ${sum} ≠ 총점 ${report.total}`);
  if (report.total < 0 || report.total > 100) problems.push(`총점 범위 ${report.total}`);
  for (const item of report.items) {
    if (!Number.isInteger(item.score) || item.score < 0 || item.score > 10) problems.push(`${item.label} ${item.score}점`);
    if (!item.hint) problems.push(`${item.label} 근거 없음`);
  }
  if (!report.grade || !report.comment) problems.push('등급/멘트 없음');
  // 같은 입력은 항상 같은 결과
  const again = scoreTake(scenario.frames, scenario.duration, {});
  if (again.total !== report.total) problems.push('같은 입력인데 총점이 달라짐');
  if (problems.length) failed += 1;
  rows.push({ ...report, name: scenario.name, problems });
}

const pad = (s, n) => String(s).padEnd(n, ' ');
console.log(`${pad('시나리오', 34)}${pad('총점', 6)}${pad('등급', 14)}${pad('발성비', 8)}${pad('음정', 6)}상태`);
for (const row of rows) {
  console.log(
    `${pad(row.name, 34)}${pad(`${row.total}점`, 6)}${pad(row.grade, 14)}${pad(`${Math.round(row.voicedRatio * 100)}%`, 8)}${pad(row.pitchAvailable ? 'O' : 'X', 6)}${
      row.problems.length ? `✗ ${row.problems.join(', ')}` : '정상'
    }`,
  );
}
console.log('\n상세 (멜로디 시나리오):');
const melody = rows.find((r) => r.name.startsWith('멜로디'));
for (const item of melody.items) console.log(`  ${item.label.padEnd(12)} ${String(item.score).padStart(2)}/10점  ${item.hint}`);
console.log(`  ${'총점'.padEnd(12)} ${melody.total}/100  ${melody.grade} — ${melody.comment}`);

// 기대값 점검
const silent = rows.find((r) => r.name === '무음 30초');
const shortTake = rows.find((r) => r.name === '2초만 소리');
const melodyRow = rows.find((r) => r.name.startsWith('멜로디'));
const monotone = rows.find((r) => r.name === '한 음 30초 유지');
if (silent.total > 25) {
  console.log(`\n✗ 무음인데 ${silent.total}점으로 너무 높음`);
  failed += 1;
}
if (!shortTake.shortTake) {
  console.log('\n✗ 2초 녹음이 짧은 녹음으로 표시되지 않음');
  failed += 1;
}
if (melodyRow.total < 60) {
  console.log(`\n✗ 멜로디 녹음이 ${melodyRow.total}점으로 너무 낮음 (노래 같은 입력은 60점 이상이어야 함)`);
  failed += 1;
}
if (melodyRow.total <= monotone.total) {
  console.log('\n✗ 멜로디가 한 음 유지보다 점수가 낮거나 같음');
  failed += 1;
}

if (failed) {
  console.log(`\n${failed}건 실패`);
  process.exit(1);
}
console.log('\n모든 채점 검사 통과 ✅');
