import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Heart, Loader2, Mic, Music4, Pause, Play, Trash2 } from 'lucide-react';
import type { Song } from '../data/songs';
import { useStore } from '../lib/store';
import { deleteRecording, listRecordings, type SavedRecording } from '../lib/recordings';
import { formatBytes, formatDate, formatDuration } from '../lib/format';
import { EmptyState, NumberBadge, SectionHeader } from './ui';

type Tab = 'fav' | 'rec' | 'recent';

function RecordingsList({ onGoStudio }: { onGoStudio: () => void }) {
  const [items, setItems] = useState<SavedRecording[] | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string>('');
  const { toast } = useStore();

  const load = useCallback(() => {
    listRecordings()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  useEffect(load, [load]);

  const play = (rec: SavedRecording) => {
    if (playingId === rec.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(rec.blob);
    urlRef.current = url;
    if (audioRef.current) {
      audioRef.current.src = url;
      void audioRef.current.play();
      setPlayingId(rec.id);
    }
  };

  const download = (rec: SavedRecording) => {
    const url = URL.createObjectURL(rec.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rec.title}.${rec.mime.includes('mp4') ? 'm4a' : 'webm'}`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  if (items === null) {
    return (
      <div className="flex items-center gap-2 px-2 py-6 text-[12.5px] text-zinc-400">
        <Loader2 size={14} className="animate-spin" /> 녹음을 불러오는 중…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />
      {items.length ? (
        items.map((rec) => (
          <div key={rec.id} className="panel flex items-center gap-3 p-3">
            <button
              type="button"
              onClick={() => play(rec)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-neon-500 to-neon-600 text-white"
            >
              {playingId === rec.id ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-bold text-white">{rec.title}</p>
              <p className="text-[11px] text-zinc-500">
                {formatDate(rec.createdAt)} · {formatDuration(rec.duration)} · {formatBytes(rec.size)}
              </p>
            </div>
            <button
              type="button"
              aria-label="다운로드"
              onClick={() => download(rec)}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-zinc-300"
            >
              <Download size={14} />
            </button>
            <button
              type="button"
              aria-label="삭제"
              onClick={async () => {
                if (!window.confirm('이 녹음을 지울까요?')) return;
                await deleteRecording(rec.id);
                toast('녹음을 지웠어요');
                load();
              }}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-zinc-400 hover:text-hot-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))
      ) : (
        <EmptyState
          icon={<Mic size={22} />}
          title="아직 저장한 녹음이 없어요"
          desc="스튜디오에서 노래를 부르고 저장하면 여기에 쌓여요."
          action={
            <button type="button" onClick={onGoStudio} className="btn-primary mt-2 text-[13px]">
              녹음 스튜디오 열기
            </button>
          }
        />
      )}
    </div>
  );
}

export function LibraryView({
  onOpenSong,
  onGoStudio,
}: {
  onOpenSong: (song: Song) => void;
  onGoStudio: (song?: Song) => void;
}) {
  const [tab, setTab] = useState<Tab>('fav');
  const { favoriteSongs, favorites, removeFavorite, bumpCount, recentSongs } = useStore();

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title="내 보관함" desc="애창곡 · 녹음 · 최근 본 곡" />

      <div className="flex gap-1.5 rounded-2xl bg-white/[0.05] p-1">
        {[
          { key: 'fav' as const, label: `애창곡 ${favoriteSongs.length}` },
          { key: 'rec' as const, label: '녹음' },
          { key: 'recent' as const, label: '최근' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-xl py-2 text-[12.5px] font-bold transition ${
              tab === t.key ? 'bg-white/15 text-white' : 'text-zinc-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'fav' ? (
        favoriteSongs.length ? (
          <div className="space-y-2">
            {favoriteSongs.map((song) => {
              const meta = favorites[song.id];
              return (
                <div key={song.id} className="panel p-3">
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" onClick={() => onOpenSong(song)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[14.5px] font-bold text-white">{song.title}</p>
                      <p className="truncate text-[12px] text-zinc-400">{song.singer}</p>
                    </button>
                    <div className="flex shrink-0 gap-1">
                      <NumberBadge brand="TJ" no={song.tj} />
                      <NumberBadge brand="KY" no={song.ky} />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11.5px]">
                    <span className="rounded-md bg-lime-400/15 px-1.5 py-0.5 font-bold text-lime-300">
                      내 키 {meta.key > 0 ? `+${meta.key}` : meta.key}
                    </span>
                    <span className="rounded-md bg-neon-500/20 px-1.5 py-0.5 font-bold text-neon-300">
                      템포 {meta.tempo > 0 ? `+${meta.tempo}` : meta.tempo}%
                    </span>
                    <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-zinc-300">{meta.count}번 불렀어요</span>
                  </div>
                  {meta.memo ? <p className="mt-1.5 rounded-xl bg-white/5 px-2.5 py-1.5 text-[11.5px] text-zinc-300">{meta.memo}</p> : null}
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => bumpCount(song.id)} className="btn-lime flex-1 py-1.5 text-[11.5px]">
                      +1회
                    </button>
                    <button type="button" onClick={() => onOpenSong(song)} className="btn-soft flex-1 py-1.5 text-[11.5px]">
                      키·메모 수정
                    </button>
                    <button type="button" onClick={() => onGoStudio(song)} className="btn-soft px-3 py-1.5 text-[11.5px]">
                      <Mic size={13} />
                    </button>
                    <button
                      type="button"
                      aria-label="애창곡에서 빼기"
                      onClick={() => removeFavorite(song.id)}
                      className="btn-ghost px-2 py-1.5 text-zinc-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Heart size={22} />}
            title="애창곡이 없어요"
            desc="곡을 열어 내 키·템포·메모를 저장하면 여기에 모여요."
          />
        )
      ) : null}

      {tab === 'rec' ? (
        <div className="space-y-3">
          <button type="button" onClick={() => onGoStudio()} className="btn-primary w-full text-[13px]">
            <Mic size={15} /> 새로 녹음하기
          </button>
          <RecordingsList onGoStudio={() => onGoStudio()} />
        </div>
      ) : null}

      {tab === 'recent' ? (
        recentSongs.length ? (
          <div className="panel divide-y divide-white/[0.06] p-1.5">
            {recentSongs.map((song) => (
              <button
                key={song.id}
                type="button"
                onClick={() => onOpenSong(song)}
                className="flex w-full items-center gap-3 px-2 py-2.5 text-left"
              >
                <Music4 size={15} className="shrink-0 text-zinc-500" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold text-white">{song.title}</span>
                  <span className="block truncate text-[11.5px] text-zinc-400">{song.singer}</span>
                </span>
                <NumberBadge brand="TJ" no={song.tj} />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon={<Music4 size={22} />} title="최근 본 곡이 없어요" />
        )
      ) : null}
    </div>
  );
}
