import { useId } from 'react';

/**
 * 싱픽 브랜드 마크 — 네온 노래방 무대(스포트라이트 + 사운드 링 + 마이크 + 이퀄라이저 + 음표).
 * 앱 아이콘(public/icon-*.png, favicon.svg)과 같은 도안을 SVG로 옮긴 것.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const bg = `bm-bg-${uid}`;
  const bars = `bm-bars-${uid}`;
  const glow = `bm-glow-${uid}`;
  const tile = `bm-tile-${uid}`;

  return (
    <svg viewBox="0 0 1024 1024" className={className} role="img" aria-label="싱픽">
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1a0f3c" />
          <stop offset="0.55" stopColor="#0c0819" />
          <stop offset="1" stopColor="#12061a" />
        </linearGradient>
        <radialGradient id={tile} cx="0.24" cy="0.12" r="0.85">
          <stop offset="0" stopColor="#7c3aed" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#4c1d95" stopOpacity="0.25" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={bars} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="0.28" stopColor="#ec4899" />
          <stop offset="0.5" stopColor="#d9f99d" />
          <stop offset="0.72" stopColor="#ec4899" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id={glow} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>

      <rect width="1024" height="1024" rx="232" fill={`url(#${bg})`} />
      <rect width="1024" height="1024" rx="232" fill={`url(#${tile})`} />
      <circle cx="905" cy="800" r="420" fill="#f43f5e" opacity="0.2" />
      <circle cx="90" cy="930" r="300" fill="#a3e635" opacity="0.13" />

      {/* 스포트라이트 */}
      <path d="M440 -40 L584 -40 L742 880 L268 880 Z" fill="#ffffff" opacity="0.075" />
      <path d="M660 -40 L740 -40 L1010 780 L740 900 Z" fill="#d8b4fe" opacity="0.07" />

      {/* 사운드 링 */}
      <g stroke="#c4b5fd" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M575 115 A205 205 0 0 1 575 505" />
        <path d="M449 505 A205 205 0 0 1 449 115" />
        <path d="M590 70 A252 252 0 0 1 590 550" opacity="0.75" />
        <path d="M434 550 A252 252 0 0 1 434 70" opacity="0.75" />
        <path d="M604 26 A299 299 0 0 1 604 594" opacity="0.5" />
        <path d="M420 594 A299 299 0 0 1 420 26" opacity="0.5" />
      </g>

      {/* 마이크 (글로우 + 본체) */}
      <g fill="#ffffff">
        <g filter={`url(#${glow})`} opacity="0.85">
          <rect x="424" y="140" width="176" height="280" rx="88" />
          <path d="M322 490 A190 190 0 0 0 702 490" stroke="#c4b5fd" strokeWidth="24" fill="none" />
        </g>
        <rect x="424" y="140" width="176" height="280" rx="88" />
      </g>
      <g stroke="#b09cf6" strokeWidth="11" strokeLinecap="round">
        <line x1="458" y1="228" x2="566" y2="228" />
        <line x1="458" y1="278" x2="566" y2="278" />
        <line x1="458" y1="328" x2="566" y2="328" />
      </g>
      <path
        d="M322 490 A190 190 0 0 0 702 490"
        stroke="#ffffff"
        strokeWidth="24"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M502 680 h22 v50 h-22 z" fill="#ffffff" />
      <rect x="452" y="726" width="122" height="24" rx="12" fill="#ffffff" />
      <rect x="470" y="438" width="84" height="14" rx="7" fill="#a3e635" />

      {/* 이퀄라이저 */}
      <g fill={`url(#${bars})`} opacity="0.96">
        <rect x="120" y="954" width="44" height="55" rx="22" />
        <rect x="194" y="915" width="44" height="94" rx="22" />
        <rect x="268" y="861" width="44" height="148" rx="22" />
        <rect x="342" y="900" width="44" height="109" rx="22" />
        <rect x="416" y="826" width="44" height="183" rx="22" />
        <rect x="490" y="892" width="44" height="117" rx="22" />
        <rect x="564" y="810" width="44" height="199" rx="22" />
        <rect x="638" y="884" width="44" height="125" rx="22" />
        <rect x="712" y="849" width="44" height="160" rx="22" />
        <rect x="786" y="919" width="44" height="90" rx="22" />
        <rect x="860" y="950" width="44" height="59" rx="22" />
      </g>

      {/* 음표 & 스파클 */}
      <g fill="#fbcfe8">
        <ellipse cx="138" cy="190" rx="24" ry="18" />
        <rect x="152" y="60" width="11" height="132" rx="5" />
        <path d="M152 60 l52 22 v31 l-52-24 z" />
        <ellipse cx="890" cy="133" rx="20" ry="15" />
        <ellipse cx="982" cy="133" rx="20" ry="15" />
        <rect x="901" y="20" width="10" height="115" rx="5" />
        <rect x="992" y="20" width="10" height="115" rx="5" />
        <rect x="901" y="20" width="101" height="16" rx="8" />
      </g>
      <path
        d="M870 320 l10 28 28 10 -28 10 -10 28 -10 -28 -28 -10 28 -10 z"
        fill="#a3e635"
      />
    </svg>
  );
}

/** 마크 + 워드마크 ('싱픽') 조합 */
export function BrandLockup({ className = '', markClassName = 'h-9 w-9' }: { className?: string; markClassName?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <BrandMark className={`${markClassName} shrink-0 rounded-[28%] shadow-[0_0_22px_-6px_rgba(167,139,250,0.75)]`} />
      <span className="text-[18px] font-black leading-none tracking-tight text-white">싱픽</span>
    </span>
  );
}
