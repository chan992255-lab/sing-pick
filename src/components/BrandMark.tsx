/**
 * 싱픽 브랜드 마크 — 앱 아이콘(3D 아트워크)과 같은 이미지를 헤더에서 그대로 쓴다.
 * public/icon-192.png 를 36px(레티나 72px)로 표시하므로 충분히 선명하다.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}icon-192.png`}
      alt="싱픽"
      width={72}
      height={72}
      decoding="async"
      className={`${className} rounded-[28%] object-cover shadow-[0_0_22px_-6px_rgba(167,139,250,0.9)]`}
    />
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
      <BrandMark className={`${markClassName} shrink-0`} />
      <span className="text-[18px] font-black leading-none tracking-tight text-white">싱픽</span>
    </span>
  );
}
