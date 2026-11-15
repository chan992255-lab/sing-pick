/**
 * 싱픽 브랜드 마크 — 앱 아이콘(3D 아트워크)과 같은 이미지를 헤더에서 그대로 쓴다.
 * 36px에서도 또렷하게 보이도록 네온 그라데이션 링을 둘러 준다.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`${className} inline-grid shrink-0 place-items-center rounded-[28%] bg-gradient-to-br from-neon-400 via-fuchsia-400 to-lime-300 p-[1.5px] shadow-[0_0_18px_-4px_rgba(167,139,250,0.9)]`}
    >
      <img
        src={`${import.meta.env.BASE_URL}icon-192.png`}
        alt="싱픽"
        width={72}
        height={72}
        decoding="async"
        className="h-full w-full rounded-[26%] object-cover"
      />
    </span>
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
      <BrandMark className={markClassName} />
      <span className="text-[18px] font-black leading-none tracking-tight text-white">싱픽</span>
    </span>
  );
}
