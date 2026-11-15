// 노래방 점수 계산 (10개 항목 × 10점 = 100점 만점)
//
// 입력은 녹음 중 마이크 신호로 모은 분석 프레임(recorder.ts 의 AudioFrame)뿐이다.
// 원곡 음정과 대조하지는 않는다. 그래서 "음정 정확도" 는 반음 그리드에서 얼마나
// 벗어나 흔들렸는지(튜닝 오차·피치 안정성), "박자·리듬감" 은 발성 시작점의 규칙성
// 같은 식으로, 실제로 잴 수 있는 것만 잰다. 값은 난수를 쓰지 않으므로 같은 녹음은
// 항상 같은 점수가 나온다.

import type { AudioFrame } from './recorder';

export interface ScoreItem {
  key: string;
  label: string;
  /** 0 ~ 10 정수 */
  score: number;
  /** 이 점수가 나온 근거 한 줄 */
  hint: string;
}

export interface ScoreReport {
  /** 10개 항목 합계 0 ~ 100 */
  total: number;
  grade: string;
  comment: string;
  tone: 'legend' | 'great' | 'good' | 'ok' | 'rookie';
  items: ScoreItem[];
  duration: number;
  /** 전체 프레임 중 실제로 소리가 잡힌 비율 */
  voicedRatio: number;
  /** 분석할 프레임이 충분했는지 */
  measured: boolean;
  /** 음정 분석이 가능했는지 */
  pitchAvailable: boolean;
  /** 3초 미만 등 채점이 아쉬운 짧은 녹음 */
  shortTake: boolean;
}

const clamp01 = (x: number) => (Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : 0);

/** x 가 [min, max] 안이면 1, 바깥이면 span 만큼의 폭으로 부드럽게 0 까지 떨어진다. */
function band(x: number, min: number, max: number, span: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < min) return clamp01(1 - (min - x) / span);
  if (x > max) return clamp01(1 - (x - max) / span);
  return 1;
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * p;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

function stdev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(mean(values.map((v) => (v - m) * (v - m))));
}

const toSemitone = (hz: number) => 69 + 12 * Math.log2(hz / 440);

/** 점수 포인트: 잘 부르면 후하게, 아무것도 안 하면 낮게 */
const toPoints = (metric: number) => Math.max(0, Math.min(10, Math.round(1.8 + 8.2 * Math.pow(clamp01(metric), 0.85))));

interface Run {
  length: number;
  start: number;
}

/** 발성 구간(연속으로 소리가 난 구간) 목록. 0.1초 미만 틈은 이어 붙인다. */
function voicingRuns(frames: AudioFrame[], voiced: boolean[]): Run[] {
  const runs: Run[] = [];
  let start = -1;
  let lastT = 0;
  for (let i = 0; i < frames.length; i += 1) {
    const t = frames[i].t;
    if (voiced[i]) {
      if (start < 0) start = t;
      else if (t - lastT > 0.1) {
        runs.push({ start, length: lastT - start });
        start = t;
      }
      lastT = t;
    } else if (start >= 0 && t - lastT > 0.1) {
      runs.push({ start, length: lastT - start });
      start = -1;
    }
  }
  if (start >= 0) runs.push({ start, length: lastT - start });
  return runs.filter((r) => r.length > 0.05);
}

function gradeFor(total: number, voicedRatio: number): { grade: string; comment: string; tone: ScoreReport['tone'] } {
  if (voicedRatio < 0.04) {
    return {
      grade: '소리 없음',
      comment: '마이크에 목소리가 거의 안 들어왔어요. 이어폰 마이크를 쓰거나 조금 더 크게 불러 볼까요?',
      tone: 'rookie',
    };
  }
  if (total >= 97) return { grade: '전설의 무대', comment: '노래방 기계도 널 의심했어. 이건 저장하고 자랑해야 해 🔥', tone: 'legend' };
  if (total >= 93) return { grade: '가수급', comment: '오늘 목 상태 최고! 마이크 잡은 손이 프로였어요.', tone: 'legend' };
  if (total >= 88) return { grade: '노래방 에이스', comment: '이 정도면 예약석 각. 다음 곡도 기대할게요!', tone: 'great' };
  if (total >= 82) return { grade: '오늘의 주인공', comment: '박수 갈 준비 됐어요. 무대가 확실히 살아났어요 👏', tone: 'great' };
  if (total >= 75) return { grade: '흥 폭발', comment: '멜로디는 잡았고 흥이 좋아요. 조금만 더 다듬으면 90점대!', tone: 'good' };
  if (total >= 68) return { grade: '무난한 실력', comment: '안정적이에요. 고음 구간만 연습하면 점수 확 올라가요.', tone: 'good' };
  if (total >= 60) return { grade: '연습생', comment: '기본은 갖췄어요. 한 소절씩 천천히 불러 봐요.', tone: 'ok' };
  if (total >= 50) return { grade: '조금만 더!', comment: '숨이 먼저 달리는 느낌이에요. 후렴 전에 크게 한 번 쉬어 가요.', tone: 'ok' };
  return { grade: '다시 도전', comment: '이번엔 짧게 한 소절만 천천히 불러 봐요. 금방 올라가요!', tone: 'rookie' };
}

export function scoreTake(
  frames: AudioFrame[],
  duration: number,
  options: { songDuration?: number | null } = {},
): ScoreReport {
  const clean = Array.isArray(frames) ? frames.filter((f) => Number.isFinite(f.rms)) : [];
  const takenAt = clean.length ? clean[clean.length - 1].t : 0;
  const takeDuration = Math.max(0.1, duration || takenAt, takenAt);

  if (clean.length < 8) {
    const items: ScoreItem[] = [
      ['pitch', '음정 정확도'],
      ['rhythm', '박자·리듬감'],
      ['volume', '성량·발성'],
      ['breath', '호흡·지속력'],
      ['range', '고음·음역 표현'],
      ['timbre', '음색·안정감'],
      ['emotion', '감정·표현력'],
      ['dynamics', '강약 조절'],
      ['completion', '완곡·집중도'],
      ['vibe', '무대 매너·바이브'],
    ].map(([key, label]) => ({ key, label, score: 0, hint: '분석할 소리가 없었어요' }));
    return {
      total: 0,
      grade: '측정 불가',
      comment: '녹음이 너무 짧아서 채점할 소리가 없었어요. 다시 한번 불러 주세요!',
      tone: 'rookie',
      items,
      duration: takeDuration,
      voicedRatio: 0,
      measured: false,
      pitchAvailable: false,
      shortTake: takeDuration < 3,
    };
  }

  const rms = clean.map((f) => f.rms);
  const loudLevel = percentile(rms, 0.95);
  const voiceFloor = Math.max(0.008, loudLevel * 0.15);
  const voiced = clean.map((f) => f.rms >= voiceFloor);
  const voicedFrames = clean.filter((_, i) => voiced[i]);
  const voicedRatio = voicedFrames.length / clean.length;
  const measured = voicedFrames.length >= 10;

  // ---- 음량·발성 ----
  const voicedRms = voicedFrames.map((f) => f.rms);
  const meanRms = mean(voicedRms);
  const dynamicDb = 20 * Math.log10(Math.max(1e-4, percentile(voicedRms, 0.9)) / Math.max(1e-4, percentile(voicedRms, 0.2)));
  const clipShare = clean.filter((f) => f.peak > 0.985).length / clean.length;

  // ---- 발성 구간 ----
  const runs = voicingRuns(clean, voiced);
  const longestRun = runs.reduce((m, r) => Math.max(m, r.length), 0);
  const meanRun = mean(runs.map((r) => r.length));

  let longestGap = 0;
  let prevEnd = 0;
  for (const run of runs) {
    longestGap = Math.max(longestGap, run.start - prevEnd);
    prevEnd = run.start + run.length;
  }
  if (runs.length) longestGap = Math.max(longestGap, takeDuration - prevEnd);

  // ---- 피치 ----
  const pitched = voicedFrames.filter((f) => f.pitch > 60 && f.pitchConf > 0.3);
  const pitchAvailable = measured && pitched.length >= Math.max(6, voicedFrames.length * 0.08);
  const semis = pitched.map((f) => toSemitone(f.pitch));
  const pitchRange = semis.length ? percentile(semis, 0.95) - percentile(semis, 0.05) : 0;
  const tuningDev = pitched.length ? percentile(pitched.map((f) => Math.abs(f.tuning)), 0.5) : 50;
  const pitchConf = pitched.length ? percentile(pitched.map((f) => f.pitchConf), 0.5) : 0;

  let moveCents = 0;
  let reversals = 0;
  let steps = 0;
  for (let i = 1; i < semis.length; i += 1) {
    const d = semis[i] - semis[i - 1];
    moveCents += Math.abs(d) * 100;
    if (Math.abs(d) > 0.15) {
      steps += 1;
      if (i > 2 && Math.sign(d) !== Math.sign(semis[i - 1] - semis[i - 2])) reversals += 1;
    }
  }
  moveCents = semis.length > 1 ? moveCents / (semis.length - 1) : 0;
  const vibratoRate = steps > 4 ? reversals / Math.max(1, takeDuration) : 0;
  const highPitchShare = semis.length
    ? semis.filter((s) => s > percentile(semis, 0.5) + 4).length / semis.length
    : 0;

  // ---- 스펙트럼·리듬 ----
  const centroidCv = (() => {
    const values = voicedFrames.map((f) => f.centroid).filter((v) => v > 20);
    const m = mean(values);
    return m > 0 ? stdev(values) / m : 1;
  })();
  const midShare = percentile(voicedFrames.map((f) => f.mid), 0.5);
  const highShare = percentile(voicedFrames.map((f) => f.high), 0.8);
  const zcrMedian = percentile(voicedFrames.map((f) => f.zcr), 0.5);
  const fluxMean = mean(voicedFrames.map((f) => f.flux));

  // 음량 봉우리(발음·박자) — 소리 크기가 올라갔다 내려오는 지점. 지속음만 있으면 거의 0
  const peaks: number[] = [];
  for (let i = 2; i < clean.length - 2; i += 1) {
    const cur = clean[i];
    if (cur.rms < voiceFloor * 1.15) continue;
    if (cur.rms > clean[i - 2].rms * 1.04 && cur.rms >= clean[i + 2].rms * 1.02) {
      if (cur.t - (peaks[peaks.length - 1] ?? -1) > 0.12) peaks.push(cur.t);
    }
  }
  const peakRate = peaks.length / Math.max(1, takeDuration);
  const peakIntervals: number[] = [];
  for (let i = 1; i < peaks.length; i += 1) peakIntervals.push(peaks[i] - peaks[i - 1]);
  const intervalCv = () => {
    if (peakIntervals.length < 3) return 0.9;
    const m = mean(peakIntervals);
    return m > 0 ? stdev(peakIntervals) / m : 0.9;
  };

  // 꼬리(끝까지 불렀는지) · 머리(첫 소절을 놓치지 않았는지)
  const tailWindow = Math.max(1.2, takeDuration * 0.15);
  const tailFrames = clean.filter((f) => f.t >= takeDuration - tailWindow);
  const tailCoverage = tailFrames.length ? tailFrames.filter((f) => f.rms >= voiceFloor).length / tailFrames.length : 0;
  const headWindow = Math.max(0.8, takeDuration * 0.1);
  const headFrames = clean.filter((f) => f.t <= headWindow);
  const headCoverage = headFrames.length ? headFrames.filter((f) => f.rms >= voiceFloor).length / headFrames.length : 0;

  // 구간별 음량 흐름 (강약·바이브)
  const blocks: number[] = [];
  const blockCount = 8;
  for (let b = 0; b < blockCount; b += 1) {
    const from = (takeDuration * b) / blockCount;
    const to = (takeDuration * (b + 1)) / blockCount;
    const inBlock = voicedFrames.filter((f) => f.t >= from && f.t < to).map((f) => f.rms);
    if (inBlock.length) blocks.push(mean(inBlock));
  }
  const blockCv = blocks.length >= 2 && mean(blocks) > 0 ? stdev(blocks) / mean(blocks) : 0;
  const firstThird = voicedFrames.filter((f) => f.t < takeDuration / 3).map((f) => f.rms);
  const lastThird = voicedFrames.filter((f) => f.t > (takeDuration * 2) / 3).map((f) => f.rms);
  const contrastDb = firstThird.length && lastThird.length
    ? Math.abs(20 * Math.log10(Math.max(1e-4, mean(firstThird)) / Math.max(1e-4, mean(lastThird))))
    : 0;
  const softShare = voicedRms.length
    ? voicedRms.filter((v) => 20 * Math.log10(Math.max(1e-4, v) / Math.max(1e-4, meanRms)) < -4).length / voicedRms.length
    : 0;

  // ---- 10개 항목 ----
  const pitchMetric = pitchAvailable
    ? 0.45 * band(tuningDev, 0, 18, 30) +
      0.35 * clamp01((pitchConf - 0.15) / 0.7) +
      0.2 * band(pitched.length / Math.max(1, voicedFrames.length), 0.25, 1, 0.25)
    : 0.5 * band(voicedRatio, 0.5, 1, 0.4);

  const rhythmMetric =
    0.45 * band(peakRate, 0.8, 4, 1.2) +
    0.3 * clamp01(1 - (intervalCv() - 0.15) / 0.95) +
    0.25 * band(fluxMean, 0.05, 0.35, 0.1);

  const volumeMetric =
    0.6 * band(meanRms, 0.045, 0.22, 0.05) +
    0.25 * band(voicedRms.filter((v) => v >= 0.03 && v <= 0.35).length / Math.max(1, voicedRms.length), 0.55, 1, 0.45) +
    0.15 * clamp01(1 - clipShare * 4);

  const breathMetric =
    0.45 * band(longestRun, 2.2, 30, 2.4) +
    0.3 * band(voicedRatio, 0.55, 1, 0.4) +
    0.25 * band(meanRun, 0.9, 10, 1);

  const rangeMetric =
    0.55 * band(pitchRange, 8, 26, 7) + 0.3 * band(highShare, 0.1, 0.45, 0.12) + 0.15 * band(highPitchShare, 0.08, 0.35, 0.15);

  const timbreMetric =
    0.4 * clamp01(1 - (centroidCv - 0.18) / 0.45) + 0.35 * band(midShare, 0.35, 0.95, 0.28) + 0.25 * band(zcrMedian, 0.012, 0.13, 0.07);

  const emotionMetric =
    0.45 * band(moveCents, 60, 420, 90) + 0.35 * band(dynamicDb, 6, 22, 5) + 0.2 * band(vibratoRate, 2.2, 9, 2.6);

  const dynamicsMetric =
    0.45 * band(dynamicDb, 10, 26, 7) + 0.3 * band(contrastDb, 1.5, 14, 3) + 0.25 * band(softShare, 0.12, 0.6, 0.2);

  const completionBase = 0.35 * band(voicedRatio, 0.6, 1, 0.35) + 0.2 * band(tailCoverage, 0.5, 1, 0.45);
  const gapScore = clamp01(1 - (longestGap - 1.2) / 3.5);
  const songDuration = options.songDuration && options.songDuration > 30 ? options.songDuration : null;
  const completionMetric = songDuration
    ? completionBase + 0.2 * gapScore + 0.25 * clamp01(takeDuration / (songDuration * 0.85))
    : completionBase + 0.2 * gapScore + 0.25 * band(headCoverage, 0.45, 1, 0.45);

  const vibeMetric =
    0.45 * clamp01(1 - (blockCv - 0.06) / 0.5) +
    0.3 * (0.5 * band(voicedRatio, 0.6, 1, 0.35) + 0.5 * Math.min(1, takeDuration / 45)) +
    0.25 * (0.5 * band(fluxMean, 0.05, 0.4, 0.12) + 0.5 * band(peakRate, 0.7, 4.4, 1.2));

  const items: ScoreItem[] = [
    {
      key: 'pitch',
      label: '음정 정확도',
      score: toPoints(pitchMetric),
      hint: pitchAvailable ? `평균 음정 오차 ±${tuningDev.toFixed(0)}센트` : '음정을 잡기 어려운 녹음이었어요',
    },
    {
      key: 'rhythm',
      label: '박자·리듬감',
      score: toPoints(rhythmMetric),
      hint: `음량 봉우리 ${peaks.length}번 · ${peakRate.toFixed(1)}회/초`,
    },
    {
      key: 'volume',
      label: '성량·발성',
      score: toPoints(volumeMetric),
      hint: `평균 음량 ${(20 * Math.log10(Math.max(1e-4, meanRms))).toFixed(0)}dB`,
    },
    {
      key: 'breath',
      label: '호흡·지속력',
      score: toPoints(breathMetric),
      hint: `가장 긴 소리 ${longestRun.toFixed(1)}초`,
    },
    {
      key: 'range',
      label: '고음·음역 표현',
      score: toPoints(rangeMetric),
      hint: pitchAvailable ? `음역 폭 ${pitchRange.toFixed(1)}반음` : '고역 에너지로 채점했어요',
    },
    {
      key: 'timbre',
      label: '음색·안정감',
      score: toPoints(timbreMetric),
      hint: `음색 흔들림 ${(centroidCv * 100).toFixed(0)}%`,
    },
    {
      key: 'emotion',
      label: '감정·표현력',
      score: toPoints(emotionMetric),
      hint: `음정 움직임 ${moveCents.toFixed(0)}센트/프레임`,
    },
    {
      key: 'dynamics',
      label: '강약 조절',
      score: toPoints(dynamicsMetric),
      hint: `음량 폭 ${dynamicDb.toFixed(0)}dB`,
    },
    {
      key: 'completion',
      label: '완곡·집중도',
      score: toPoints(completionMetric),
      hint: `발성 비율 ${(voicedRatio * 100).toFixed(0)}% · 가장 긴 공백 ${longestGap.toFixed(1)}초`,
    },
    {
      key: 'vibe',
      label: '무대 매너·바이브',
      score: toPoints(vibeMetric),
      hint: `구간별 음량 편차 ${(blockCv * 100).toFixed(0)}%`,
    },
  ];

  // 짧은 녹음은 근거가 적으니 항목 점수를 조금 낮춰 잡는다 (3초 미만은 재도전 안내)
  const lengthFactor = measured && takeDuration < 12 ? 0.82 + 0.18 * (takeDuration / 12) : 1;
  const scaledItems = items.map((item) => ({ ...item, score: Math.round(item.score * lengthFactor) }));
  const cappedItems = measured ? scaledItems : scaledItems.map((item) => ({ ...item, score: Math.min(item.score, 2) }));
  const total = cappedItems.reduce((sum, item) => sum + item.score, 0);
  const shortTake = takeDuration < 3;
  const { grade, comment, tone } = gradeFor(total, voicedRatio);

  return {
    total,
    grade: shortTake ? '짧은 도전' : grade,
    comment: shortTake
      ? '3초가 안 돼서 채점이 아쉬워요. 한 소절만 더 불러 볼까요?'
      : comment,
    tone,
    items: cappedItems,
    duration: takeDuration,
    voicedRatio,
    measured,
    pitchAvailable,
    shortTake,
  };
}
