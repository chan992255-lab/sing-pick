import { Heart, Mic, Minus, Music4, Plus, Trash2 } from 'lucide-react';
import type { Song } from '../data/songs';
import { useStore } from '../lib/store';
import { NumberBadge, SetlistButton, Sheet, SongMetaLine } from './ui';
import { LyricsBlock } from './LyricsBlock';
import { SongPlayer } from './SongPlayer';
import { moodLabel } from '../lib/format';

function KeyPad({ song }: { song: Song }) {
  const { favorites, updateFavorite, addFavorite, bumpCount } = useStore();
  const fav = favorites[song.id];

  if (!fav) {
    return (
      <button type="button" onClick={() => addFavorite(song)} className="btn-primary mt-3 w-full">
        <Heart size={15} /> 애창곡으로 담고 키·메모 저장하기
      </button>
    );
  }

  const setKey = (delta: number) =>
    updateFavorite(song.id, { key: Math.max(-6, Math.min(6, fav.key + delta)) });
  const setTempo = (delta: number) =>
    updateFavorite(song.id, { tempo: Math.max(-20, Math.min(20, fav.tempo + delta)) });

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-neon-500/10 to-transparent p-4">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-bold text-zinc-300">내 키</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setKey(-1)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white">
            <Minus size={15} />
          </button>
          <span className="w-12 text-center font-mono text-[17px] font-black text-lime-300">
            {fav.key > 0 ? `+${fav.key}` : fav.key}
          </span>
          <button type="button" onClick={() => setKey(1)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white">
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-bold text-zinc-300">템포</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setTempo(-5)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white">
            <Minus size={15} />
          </button>
          <span className="w-12 text-center font-mono text-[15px] font-black text-neon-300">
            {fav.tempo > 0 ? `+${fav.tempo}` : fav.tempo}%
          </span>
          <button type="button" onClick={() => setTempo(5)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white">
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div>
        <label className="label" htmlFor={`memo-${song.id}`}>
          나만의 팁 메모
        </label>
        <textarea
          id={`memo-${song.id}`}
          value={fav.memo}
          onChange={(e) => updateFavorite(song.id, { memo: e.target.value })}
          rows={2}
          placeholder="예) 1절 후렴은 가성, 원키는 높으니 -2키"
          className="field resize-none text-[13px]"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="muted">부른 횟수 {fav.count}번</span>
        <button type="button" onClick={() => bumpCount(song.id)} className="btn-lime px-3 py-1.5 text-[12px]">
          한 번 불렀어요
        </button>
      </div>
    </div>
  );
}

export function SongSheet({
  song,
  open,
  onClose,
  onRecord,
}: {
  song: Song | null;
  open: boolean;
  onClose: () => void;
  onRecord: (song: Song) => void;
}) {
  const { favorites, removeFavorite, addFavorite } = useStore();
  if (!song) return null;
  const fav = favorites[song.id];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={
        <div className="min-w-0">
          <p className="truncate text-[18px] font-extrabold text-white">{song.title}</p>
          <p className="truncate text-[12.5px] text-zinc-400">{song.singer}</p>
        </div>
      }
      footer={
        <div className="flex gap-2">
          <button type="button" onClick={() => onRecord(song)} className="btn-primary flex-1">
            <Mic size={16} /> 녹음하기
          </button>
          <SetlistButton song={song} />
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <NumberBadge brand="TJ" no={song.tj} />
        <NumberBadge brand="KY" no={song.ky} />
        <SongMetaLine song={song} />
      </div>

      {song.moods.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {song.moods.map((m) => (
            <span key={m} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">
              {moodLabel(m)}
            </span>
          ))}
        </div>
      ) : null}

      <KeyPad song={song} />

      {fav ? (
        <button
          type="button"
          onClick={() => {
            removeFavorite(song.id);
            onClose();
          }}
          className="mt-2 flex w-full items-center justify-center gap-1 text-[11.5px] text-zinc-500 hover:text-hot-400"
        >
          <Trash2 size={12} /> 애창곡에서 빼기
        </button>
      ) : (
        <button
          type="button"
          onClick={() => addFavorite(song)}
          className="mt-2 flex w-full items-center justify-center gap-1 text-[11.5px] text-zinc-500 hover:text-white"
        >
          <Music4 size={12} /> 애창곡에 담기
        </button>
      )}

      <div className="mt-3">
        <SongPlayer song={song} />
      </div>

      <div className="mt-3">
        <LyricsBlock song={song} />
      </div>
    </Sheet>
  );
}
