import { useMemo, useRef, useState } from 'react';
import { Dices, RotateCcw } from 'lucide-react';
import { SONGS, type Song } from '../data/songs';
import { MOODS } from '../lib/format';
import { useStore } from '../lib/store';
import { NumberBadge, SectionHeader, SetlistButton } from './ui';

const SEGMENTS = 8;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function RouletteView({ onOpenSong }: { onOpenSong: (song: Song) => void }) {
  const [mood, setMood] = useState<string>('all');
  const [wheel, setWheel] = useState<Song[]>(() => shuffle(SONGS).slice(0, SEGMENTS));
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Song | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const { addToSetlist, addFavorite, favorites } = useStore();

  const pool = useMemo(() => {
    if (mood === 'all') return SONGS;
    const filtered = SONGS.filter((s) => s.moods.includes(mood as never));
    return filtered.length >= SEGMENTS ? filtered : SONGS;
  }, [mood]);

  const spin = () => {
    if (spinning) return;
    const next = shuffle(pool).slice(0, SEGMENTS);
    const index = Math.floor(Math.random() * SEGMENTS);
    setWheel(next);
    setWinner(null);
    setSpinning(true);
    const segmentAngle = 360 / SEGMENTS;
    // 5바퀴 + 당첨 칸 중앙으로
    const target = 360 * 5 + (360 - (index * segmentAngle + segmentAngle / 2));
    setAngle((prev) => prev + target);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setWinner(next[index]);
      setSpinning(false);
    }, 3400);
  };

  const gradient = `conic-gradient(${wheel
    .map((_, i) => {
      const start = (360 / SEGMENTS) * i;
      const end = (360 / SEGMENTS) * (i + 1);
      const color = i % 2 === 0 ? 'rgba(139,92,246,0.9)' : 'rgba(244,63,94,0.75)';
      const color2 = i % 2 === 0 ? 'rgba(236,72,153,0.65)' : 'rgba(163,230,53,0.55)';
      return `${color} ${start}deg ${start + (end - start) / 2}deg, ${color2} ${start + (end - start) / 2}deg ${end}deg`;
    })
    .join(', ')})`;

  return (
    <div className="space-y-5 pb-4">
      <SectionHeader title="랜덤 선곡 룰렛" desc="뭐 부를지 못 정했을 때 한 번에" />

      <div className="scroll-x">
        <button type="button" onClick={() => setMood('all')} className={`chip ${mood === 'all' ? 'chip-active' : ''}`}>
          전체
        </button>
        {MOODS.map((m) => (
          <button key={m.key} type="button" onClick={() => setMood(m.key)} className={`chip ${mood === m.key ? 'chip-active' : ''}`}>
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-[340px] flex-col items-center">
        <div className="relative aspect-square w-full">
          <div className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2">
            <div className="h-4 w-4 rotate-45 rounded-sm bg-lime-300 shadow-[0_0_18px_rgba(163,230,53,0.9)]" />
          </div>
          <div
            className="h-full w-full rounded-full border-[6px] border-white/10 shadow-glow"
            style={{
              background: gradient,
              transform: `rotate(${angle}deg)`,
              transition: 'transform 3.2s cubic-bezier(0.15, 0.9, 0.12, 1)',
            }}
          />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="grid h-[34%] w-[34%] place-items-center rounded-full border border-white/20 bg-ink-950/90 text-center">
              <span className="text-[11px] font-black leading-tight text-white">
                {spinning ? '돌아가는 중' : 'SING\nPICK'}
              </span>
            </div>
          </div>
        </div>

        <button type="button" onClick={spin} disabled={spinning} className="btn-lime mt-5 w-full text-[15px]">
          {spinning ? '룰렛 돌아가는 중…' : winner ? <><RotateCcw size={16} /> 한 번 더 돌리기</> : <><Dices size={16} /> 룰렛 돌리기</>}
        </button>
      </div>

      {winner ? (
        <div className="animate-pop panel border-lime-400/30 bg-gradient-to-br from-lime-400/10 to-transparent p-4">
          <p className="text-[11px] font-black tracking-wide text-lime-300">오늘의 한 곡</p>
          <button type="button" onClick={() => onOpenSong(winner)} className="mt-1 block text-left">
            <p className="text-[20px] font-black leading-tight text-white">{winner.title}</p>
            <p className="text-[13px] text-zinc-300">{winner.singer}</p>
          </button>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <NumberBadge brand="TJ" no={winner.tj} />
            <NumberBadge brand="KY" no={winner.ky} />
          </div>
          <div className="mt-3 flex gap-2">
            <SetlistButton song={winner} />
            <button
              type="button"
              onClick={() => {
                addToSetlist(winner);
                addFavorite(winner);
              }}
              className="btn-soft flex-1 text-[12.5px]"
            >
              {favorites[winner.id] ? '애창곡에 있음' : '애창곡 담기'}
            </button>
          </div>
        </div>
      ) : (
        <p className="muted text-center">분위기를 고르고 룰렛을 돌려 보세요. 8곡 중 한 곡이 뽑혀요.</p>
      )}
    </div>
  );
}
