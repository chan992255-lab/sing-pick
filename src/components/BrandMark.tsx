import { useId } from 'react';

/**
 * 싱픽 브랜드 마크 — 네온 노래방 무대(사운드 링 + 마이크 + 이퀄라이저).
 * 앱 아이콘(public/icon-*.png)과 같은 도안을 헤더 크기(36px)에서도 또렷하게 보이도록
 * 굵기와 비율만 다듬은 컴팩트 버전. public/favicon.svg 와 같은 도형.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const bg = `bm-bg-${uid}`;
  const bars = `bm-bars-${uid}`;
  const glow = `bm-glow-${uid}`;
  const sheen = `bm-sheen-${uid}`;

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="싱픽">
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b1f7d" />
          <stop offset="0.55" stopColor="#1a0f33" />
          <stop offset="1" stopColor="#2b0a26" />
        </linearGradient>
        <linearGradient id={bars} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a3e635" />
          <stop offset="0.42" stopColor="#f472b6" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c4b5fd" stopOpacity="0.35" />
          <stop offset="1" stopColor="#c4b5fd" stopOpacity="0" />
        </linearGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      <rect width="64" height="64" rx="15" fill={`url(#${bg})`} />
      <rect width="64" height="64" rx="15" fill={`url(#${sheen})`} />
      <circle cx="10" cy="8" r="17" fill="#7c3aed" opacity="0.45" />
      <circle cx="57" cy="54" r="16" fill="#f43f5e" opacity="0.22" />

      {/* 사운드 링 */}
      <g stroke="#c4b5fd" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.8">
        <path d="M45.5 11.5 A17.5 17.5 0 0 1 45.5 39.5" />
        <path d="M18.5 39.5 A17.5 17.5 0 0 1 18.5 11.5" />
      </g>

      {/* 마이크 */}
      <g fill="#ffffff">
        <g filter={`url(#${glow})`} opacity="0.9">
          <rect x="26" y="9" width="12" height="19" rx="6" />
        </g>
        <rect x="26" y="9" width="12" height="19" rx="6" />
      </g>
      <g stroke="#b9a5f8" strokeWidth="1.1" strokeLinecap="round">
        <line x1="29.2" y1="14.6" x2="34.8" y2="14.6" />
        <line x1="29.2" y1="17.8" x2="34.8" y2="17.8" />
        <line x1="29.2" y1="21" x2="34.8" y2="21" />
      </g>
      <path
        d="M21 25.5 A11 11 0 0 0 43 25.5"
        stroke="#ffffff"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="32" y1="36.5" x2="32" y2="40" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="27.6" y="39.6" width="8.8" height="1.8" rx="0.9" fill="#ffffff" />
      <rect x="30" y="28.4" width="4" height="1.6" rx="0.8" fill="#a3e635" />

      {/* 이퀄라이저 */}
      <g fill={`url(#${bars})`}>
        <rect x="7" y="55" width="4.6" height="6" rx="2.3" />
        <rect x="15" y="50" width="4.6" height="11" rx="2.3" />
        <rect x="23" y="45" width="4.6" height="16" rx="2.3" />
        <rect x="31" y="48" width="4.6" height="13" rx="2.3" />
        <rect x="39" y="43.5" width="4.6" height="17.5" rx="2.3" />
        <rect x="47" y="49" width="4.6" height="12" rx="2.3" />
        <rect x="55" y="53" width="4.6" height="8" rx="2.3" />
      </g>
    </svg>
  );
}

/** 마크 + 워드마크 ('싱픽') 조합 */
export function BrandLockup({
  className = '',
  markClassName = 'h-9 w-9',
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <BrandMark className={`${markClassName} shrink-0 rounded-[28%] shadow-[0_0_22px_-6px_rgba(167,139,250,0.8)]`} />
      <span className="text-[18px] font-black leading-none tracking-tight text-white">싱픽</span>
    </span>
  );
}
