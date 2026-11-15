import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Copy, Heart, ListMusic, Plus } from 'lucide-react';
import type { Song } from '../data/songs';
import { useStore } from '../lib/store';
import { genreLabel, vocalLabel } from '../lib/format';

export function Toast() {
  const { toastMessage } = useStore();
  if (!toastMessage) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav-h)+var(--safe-b)+14px)] z-[80] flex justify-center px-6">
      <div className="animate-slide-up rounded-full border border-white/15 bg-ink-800/95 px-4 py-2.5 text-[13px] font-bold text-white shadow-glow backdrop-blur">
        {toastMessage}
      </div>
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        ref={ref}
        className="animate-sheet-up relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-ink-900 shadow-2xl sm:max-w-lg sm:rounded-[28px]"
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-bold text-zinc-300"
          >
            닫기
          </button>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">{children}</div>
        {footer ? <div className="safe-bottom border-t border-white/10 bg-ink-850/90 px-5 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}

export function NumberBadge({ brand, no }: { brand: 'TJ' | 'KY'; no: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!no) return;
    try {
      await navigator.clipboard.writeText(no);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* 클립보드가 막혀 있으면 조용히 넘어간다 */
    }
  };
  if (!no) {
    return (
      <span className="num-badge bg-white/5 text-zinc-500">
        {brand} —
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={copy}
      title={`${brand} ${no} 복사`}
      className={
        brand === 'TJ'
          ? 'num-badge bg-hot-500/15 text-hot-400 transition active:scale-95'
          : 'num-badge bg-neon-500/20 text-neon-300 transition active:scale-95'
      }
    >
      <span className="opacity-70">{brand}</span>
      <span>{no}</span>
      {copied ? <Check size={11} /> : <Copy size={10} className="opacity-50" />}
    </button>
  );
}

export function SongRow({
  song,
  rank,
  onOpen,
  onPlay,
  right,
  subtitle,
}: {
  song: Song;
  rank?: number;
  onOpen: (song: Song) => void;
  onPlay?: () => void;
  right?: ReactNode;
  subtitle?: string;
}) {
  const { favorites, setlist, toggleSetlist } = useStore();
  const fav = favorites[song.id];
  const inSet = setlist.includes(song.id);

  return (
    <div className="group flex items-center gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-white/[0.05]">
      <button type="button" onClick={() => onOpen(song)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        {typeof rank === 'number' ? (
          <span
            className={`w-6 shrink-0 text-center font-mono text-[13px] font-black tabular-nums ${
              rank <= 3 ? 'text-lime-300' : 'text-zinc-500'
            }`}
          >
            {rank}
          </span>
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon-500/30 to-hot-500/20 text-[15px] font-black text-white/90">
            {song.singer.slice(0, 1)}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[14.5px] font-bold text-white">{song.title}</span>
            {fav ? <Heart size={12} className="shrink-0 fill-hot-400 text-hot-400" /> : null}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="max-w-[46vw] truncate text-[12px] text-zinc-400">{song.singer}</span>
            <NumberBadge brand="TJ" no={song.tj} />
            <NumberBadge brand="KY" no={song.ky} />
          </span>
          {subtitle ? <span className="mt-1 block text-[11.5px] text-zinc-500">{subtitle}</span> : null}
        </span>
      </button>
      <div className="flex shrink-0 items-center gap-1">
        {right}
        {onPlay ? (
          <button
            type="button"
            onClick={onPlay}
            className="rounded-full bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white"
          >
            ▶
          </button>
        ) : null}
        <button
          type="button"
          aria-label={inSet ? '셋리스트에서 빼기' : '셋리스트에 담기'}
          onClick={() => toggleSetlist(song)}
          className={`grid h-8 w-8 place-items-center rounded-full border transition ${
            inSet
              ? 'border-lime-400/60 bg-lime-400/20 text-lime-300'
              : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
          }`}
        >
          {inSet ? <Check size={15} /> : <Plus size={15} />}
        </button>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: ReactNode;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-white/10 px-6 py-10 text-center">
      <div className="text-zinc-500">{icon}</div>
      <p className="text-[14px] font-bold text-zinc-200">{title}</p>
      {desc ? <p className="muted max-w-[260px]">{desc}</p> : null}
      {action}
    </div>
  );
}

export function SectionHeader({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-end justify-between gap-2 px-1">
      <div>
        <h2 className="section-title">{title}</h2>
        {desc ? <p className="muted mt-0.5">{desc}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function SongMetaLine({ song }: { song: Song }) {
  const { favorites } = useStore();
  const fav = favorites[song.id];
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-zinc-400">
      <span className="rounded-md bg-white/5 px-1.5 py-0.5">{genreLabel(song.genre)}</span>
      <span className="rounded-md bg-white/5 px-1.5 py-0.5">{vocalLabel(song.vocal)}</span>
      <span className="rounded-md bg-white/5 px-1.5 py-0.5">{song.era}년대</span>
      {fav?.count ? (
        <span className="rounded-md bg-lime-400/15 px-1.5 py-0.5 text-lime-300">{fav.count}번 불렀어요</span>
      ) : null}
    </div>
  );
}

export function SetlistButton({ song }: { song: Song }) {
  const { setlist, toggleSetlist } = useStore();
  const inSet = setlist.includes(song.id);
  return (
    <button type="button" onClick={() => toggleSetlist(song)} className={inSet ? 'btn-lime flex-1' : 'btn-soft flex-1'}>
      <ListMusic size={15} />
      {inSet ? '셋리스트에 있음' : '셋리스트 담기'}
    </button>
  );
}
