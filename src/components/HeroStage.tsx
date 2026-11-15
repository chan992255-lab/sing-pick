import type { CSSProperties } from 'react';
import { Search, Shuffle, Sparkles, Trophy } from 'lucide-react';

type Route = 'search' | 'roulette' | 'setlist' | 'library' | 'quiz';

/** 하단 이퀄라이저 바 — [높이(px), 애니메이션 지연(s)] */
const HERO_EQ: [number, number][] = [
  [12, 0.0], [22, 0.24], [16, 0.46], [30, 0.12], [20, 0.36], [36, 0.04], [18, 0.52], [28, 0.3],
  [14, 0.16], [32, 0.44], [22, 0.08], [38, 0.32], [16, 0.56], [26, 0.2], [34, 0.02], [20, 0.48],
  [30, 0.26], [14, 0.4], [24, 0.1], [36, 0.54], [18, 0.34], [28, 0.14], [22, 0.5], [12, 0.28],
];

const EQ_STOPS: [number, number, number][] = [
  [163, 230, 53], // 라임
  [244, 114, 182], // 핑크
  [167, 139, 250], // 바이올렛
];

/** 바 위치에 따라 라임 → 핑크 → 바이올렛으로 흐르는 색 */
function eqColor(t: number) {
  const seg = Math.min(EQ_STOPS.length - 2, Math.floor(t * (EQ_STOPS.length - 1)));
  const local = t * (EQ_STOPS.length - 1) - seg;
  const c = [0, 1, 2].map((i) =>
    Math.round(EQ_STOPS[seg][i] + (EQ_STOPS[seg + 1][i] - EQ_STOPS[seg][i]) * local),
  );
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

const QUICK: { key: Route; icon: typeof Search; label: string; sub: string; tint: string; ring: string }[] = [
  { key: 'search', icon: Search, label: '전체 곡 검색', sub: '제목·가수·번호', tint: 'text-lime-300', ring: 'bg-lime-400/15' },
  { key: 'roulette', icon: Shuffle, label: '랜덤 룰렛', sub: '고민 끝', tint: 'text-neon-300', ring: 'bg-neon-500/20' },
  { key: 'quiz', icon: Trophy, label: '18번 찾기', sub: '7문항 테스트', tint: 'text-hot-400', ring: 'bg-hot-500/20' },
];

export function HeroStage({ onNavigate }: { onNavigate: (route: Route) => void }) {
  return (
    <section
      className="hero-stage relative overflow-hidden rounded-[30px] border border-white/10"
      style={{ '--hero-img': `url(${import.meta.env.BASE_URL}hero-bg.png)` } as CSSProperties}
    >
      {/* 텍스트 자리를 살짝 더 눌러 주는 네온 스크림 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_6%_-12%,rgba(124,58,237,0.42),transparent_58%),radial-gradient(80%_70%_at_100%_100%,rgba(244,63,94,0.22),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon-300/50 to-transparent"
      />

      <div className="relative px-5 pb-5 pt-4">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10.5px] font-black tracking-wide text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md">
          <Sparkles size={11} className="text-lime-300" /> 대한민국 노래방 필수앱
        </span>

        <h1 className="mt-3 max-w-[80%] text-[27px] font-black leading-[1.16] tracking-[-0.02em] text-white [text-shadow:0_2px_18px_rgba(4,2,10,0.9)]">
          오늘은{' '}
          <span className="bg-gradient-to-r from-lime-300 via-white to-hot-400 bg-clip-text text-transparent">
            무슨 노래
          </span>
          <br />
          부를까?
        </h1>
        <p className="mt-1.5 max-w-[76%] text-[13px] leading-relaxed text-zinc-200/90 [text-shadow:0_1px_10px_rgba(4,2,10,0.9)]">
          오늘 부를 곡, <span className="font-extrabold text-white">싱픽</span>이 골라 드릴게요.
        </p>

        {/* 네온 이퀄라이저 — 무대 사운드 */}
        <div
          aria-hidden
          className="relative mt-4 flex h-10 items-end justify-between gap-[3px] [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)]"
        >
          {HERO_EQ.map(([h, d], i) => {
            const color = eqColor(i / (HERO_EQ.length - 1));
            return (
              <span
                key={i}
                className="hero-eq-bar w-full flex-1 rounded-full"
                style={{
                  height: `${h}px`,
                  background: `linear-gradient(180deg, ${color}, ${color.replace('rgb', 'rgba').replace(')', ', 0.35)')})`,
                  boxShadow: `0 0 10px ${color.replace('rgb', 'rgba').replace(')', ', 0.6)')}`,
                  animationDelay: `${d}s`,
                  animationDuration: `${1 + ((i * 7) % 5) * 0.12}s`,
                }}
              />
            );
          })}
        </div>

        <div className="mt-3.5 grid grid-cols-3 gap-2">
          {QUICK.map(({ key, icon: Icon, label, sub, tint, ring }) => (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              className="group relative flex flex-col items-start gap-1 rounded-2xl border border-white/15 bg-ink-950/45 p-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-md transition hover:border-white/30 hover:bg-ink-950/60 active:scale-[0.97]"
            >
              <span className={`grid h-7 w-7 place-items-center rounded-xl ${ring}`}>
                <Icon size={15} className={tint} strokeWidth={2.4} />
              </span>
              <span className="text-[12px] font-bold leading-tight text-white">{label}</span>
              <span className="text-[10.5px] leading-tight text-zinc-400">{sub}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
