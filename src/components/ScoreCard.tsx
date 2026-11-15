import { Check, Download, Mic, Save, Trophy, Volume2 } from 'lucide-react';
import type { ScoreReport } from '../lib/score';

const TONE = {
  legend: { ring: '#facc15', text: 'text-amber-300', chip: 'border-amber-400/30 bg-amber-400/15 text-amber-200' },
  great: { ring: '#a3e635', text: 'text-lime-300', chip: 'border-lime-400/30 bg-lime-400/15 text-lime-300' },
  good: { ring: '#a78bfa', text: 'text-neon-300', chip: 'border-neon-400/30 bg-neon-500/20 text-neon-300' },
  ok: { ring: '#fbbf24', text: 'text-amber-300', chip: 'border-amber-400/25 bg-amber-400/10 text-amber-200' },
  rookie: { ring: '#fb7185', text: 'text-hot-400', chip: 'border-hot-500/30 bg-hot-500/15 text-hot-400' },
} as const;

function ScoreRing({ total, color }: { total: number; color: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, total / 100));
  return (
    <div className="relative grid h-[136px] w-[136px] shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${c * filled} ${c}`}
          style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 10px ${color}88)` }}
        />
      </svg>
      <div className="relative text-center">
        <p className="font-mono text-[42px] font-black leading-none tabular-nums text-white">{total}</p>
        <p className="mt-1 text-[11px] font-bold text-zinc-400">/ 100점</p>
      </div>
    </div>
  );
}

function barColor(score: number): string {
  if (score >= 8) return 'from-lime-400 to-lime-300';
  if (score >= 6) return 'from-neon-400 to-lime-300';
  if (score >= 4) return 'from-amber-400 to-amber-300';
  return 'from-hot-500 to-hot-400';
}

export function ScoreCard({
  report,
  audioUrl,
  onClose,
  onRetry,
  onSave,
  onDownload,
  saved,
  title,
}: {
  report: ScoreReport;
  audioUrl: string;
  onClose: () => void;
  onRetry: () => void;
  onSave: () => void;
  onDownload: () => void;
  saved: boolean;
  title: string;
}) {
  const tone = TONE[report.tone];

  return (
    <div data-testid="score-card" className="space-y-4">
      <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4">
        <ScoreRing total={report.total} color={tone.ring} />
        <div className="min-w-0 flex-1">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-black ${tone.chip}`}>
            <Trophy size={12} /> {report.grade}
          </span>
          <p className={`mt-2 text-[13px] font-bold leading-relaxed ${tone.text}`}>{report.comment}</p>
          <p className="mt-1.5 truncate text-[11px] text-zinc-500">
            {title} · {Math.floor(report.duration / 60)}:{String(Math.round(report.duration) % 60).padStart(2, '0')} 녹음
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
        <div className="mb-1.5 flex items-center justify-between px-1">
          <p className="text-[12.5px] font-extrabold text-white">점수표 (10개 항목 · 각 10점)</p>
          <p className="font-mono text-[11px] tabular-nums text-zinc-500">합계 {report.total} / 100</p>
        </div>
        <ul className="space-y-1">
          {report.items.map((item, i) => (
            <li
              key={item.key}
              data-score-item={item.key}
              data-score={item.score}
              className="rounded-2xl px-2 py-1.5 transition hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-center font-mono text-[11px] font-black text-zinc-500">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-zinc-200">{item.label}</span>
                <span className="shrink-0 font-mono text-[12.5px] font-black tabular-nums text-white">
                  <span className={item.score >= 8 ? 'text-lime-300' : item.score >= 6 ? 'text-neon-300' : item.score >= 4 ? 'text-amber-300' : 'text-hot-400'}>
                    {item.score}
                  </span>
                  <span className="text-[11px] text-zinc-500"> / 10점</span>
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 pl-6">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barColor(item.score)}`}
                    style={{ width: `${(item.score / 10) * 100}%`, transition: 'width 700ms ease-out' }}
                  />
                </div>
                <span className="w-[46%] shrink-0 truncate text-right text-[10px] text-zinc-500">{item.hint}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <p className="mb-2 flex items-center gap-1 text-[12px] font-bold text-zinc-300">
          <Volume2 size={13} /> 방금 부른 노래
        </p>
        <audio src={audioUrl} controls className="w-full" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={onRetry} className="btn-primary text-[12.5px]">
            <Mic size={14} /> 다시 부르기
          </button>
          <button type="button" onClick={onSave} className={saved ? 'btn-soft text-[12.5px]' : 'btn-lime text-[12.5px]'}>
            {saved ? <Check size={14} /> : <Save size={14} />} {saved ? '저장됨' : '녹음 저장'}
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={onDownload} className="btn-soft text-[12px]">
            <Download size={13} /> 다운로드
          </button>
          <button type="button" onClick={onClose} className="btn-soft text-[12px]">
            결과 닫기
          </button>
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-zinc-500">
          점수는 기기 마이크로 들어온 목소리(음량·음정 흔들림·발성 구간·음색)를 분석한 값이에요. 원곡과 음정을 하나씩 대조한
          채점은 아니고, 같은 녹음이면 항상 같은 점수가 나와요.
        </p>
      </div>
    </div>
  );
}
