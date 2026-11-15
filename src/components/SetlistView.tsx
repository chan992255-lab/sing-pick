import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, Copy, Download, Link2, ListMusic, Share2, Trash2 } from 'lucide-react';
import type { Song } from '../data/songs';
import { useStore } from '../lib/store';
import { shareUrl } from '../lib/share';
import { EmptyState, NumberBadge, SectionHeader, Sheet } from './ui';

export function SetlistView({
  onOpenSong,
  onNavigate,
}: {
  onOpenSong: (song: Song) => void;
  onNavigate: (r: 'search') => void;
}) {
  const { setlistSongs, removeFromSetlist, moveInSetlist, clearSetlist, toast } = useStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = setlistSongs.length ? shareUrl(setlistSongs) : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast('공유 링크를 복사했어요');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast('복사가 막혀 있어요. 링크를 길게 눌러 복사해 주세요.');
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: '오늘의 노래방 셋리스트',
        text: `오늘 부를 ${setlistSongs.length}곡! 싱픽에서 곡번호까지 확인하세요.`,
        url,
      });
    } catch {
      /* 사용자가 취소한 경우 등 */
    }
  };

  const plainText = setlistSongs
    .map((s, i) => `${i + 1}. ${s.title} - ${s.singer} (TJ ${s.tj || '-'} / KY ${s.ky || '-'})`)
    .join('\n');

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(`${plainText}\n\n${url}`);
      toast('곡 목록과 링크를 복사했어요');
    } catch {
      toast('복사가 막혀 있어요');
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader
        title="오늘의 셋리스트"
        desc={setlistSongs.length ? `${setlistSongs.length}곡 · 순서대로 부르기` : '담은 곡이 없어요'}
        action={
          setlistSongs.length ? (
            <button type="button" onClick={() => setShareOpen(true)} className="btn-soft px-3 py-1.5 text-[12px]">
              <Share2 size={13} /> 공유
            </button>
          ) : null
        }
      />

      {setlistSongs.length ? (
        <>
          <div className="panel divide-y divide-white/[0.06] p-1.5">
            {setlistSongs.map((song, i) => (
              <div key={song.id} className="flex items-center gap-2 px-1 py-2">
                <span className="w-6 shrink-0 text-center font-mono text-[13px] font-black text-lime-300">{i + 1}</span>
                <button type="button" onClick={() => onOpenSong(song)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[14px] font-bold text-white">{song.title}</p>
                  <p className="truncate text-[11.5px] text-zinc-400">{song.singer}</p>
                  <span className="mt-1 flex gap-1">
                    <NumberBadge brand="TJ" no={song.tj} />
                    <NumberBadge brand="KY" no={song.ky} />
                  </span>
                </button>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    aria-label="위로"
                    onClick={() => moveInSetlist(song.id, -1)}
                    className="grid h-6 w-6 place-items-center rounded bg-white/5 text-zinc-400"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    aria-label="아래로"
                    onClick={() => moveInSetlist(song.id, 1)}
                    className="grid h-6 w-6 place-items-center rounded bg-white/5 text-zinc-400"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="빼기"
                  onClick={() => removeFromSetlist(song.id)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-zinc-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShareOpen(true)} className="btn-primary flex-1 text-[13px]">
              <Link2 size={15} /> 셋리스트 공유 링크
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('셋리스트를 모두 비울까요?')) clearSetlist();
              }}
              className="btn-ghost text-[12.5px]"
            >
              비우기
            </button>
          </div>
        </>
      ) : (
        <EmptyState
          icon={<ListMusic size={22} />}
          title="오늘의 셋리스트가 비어 있어요"
          desc="검색에서 곡을 찾아 + 버튼으로 담으면 여기에 순서대로 쌓여요."
          action={
            <button type="button" onClick={() => onNavigate('search')} className="btn-primary mt-2 text-[13px]">
              곡 찾으러 가기
            </button>
          }
        />
      )}

      <Sheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={
          <div>
            <p className="text-[16px] font-extrabold text-white">셋리스트 공유</p>
            <p className="text-[12px] text-zinc-400">로그인 없이 링크만 열면 곡과 번호가 보여요</p>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-ink-850 p-3">
            <p className="break-all font-mono text-[11px] leading-relaxed text-zinc-400">{url}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={copy} className="btn-primary text-[13px]">
              {copied ? <Check size={15} /> : <Copy size={15} />} 링크 복사
            </button>
            <button type="button" onClick={nativeShare} className="btn-lime text-[13px]">
              <Share2 size={15} /> 카톡·문자로
            </button>
          </div>
          <button type="button" onClick={copyText} className="btn-soft w-full text-[12.5px]">
            <Download size={14} /> 곡 목록 텍스트로 복사
          </button>
          <p className="muted">
            친구가 링크를 열면 오늘 부를 곡과 TJ·금영 번호가 그대로 보이고, 자기 셋리스트로도 담을 수 있어요.
          </p>
        </div>
      </Sheet>
    </div>
  );
}

export function SharedSetlist({ songs }: { songs: Song[] }) {
  const { importSetlist, toast } = useStore();
  const [done, setDone] = useState(false);

  if (!songs.length) {
    return (
      <div className="py-10">
        <EmptyState
          icon={<Link2 size={22} />}
          title="공유 링크를 읽을 수 없어요"
          desc="링크가 잘렸거나 오래된 형식일 수 있어요. 친구에게 다시 공유를 요청해 보세요."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="panel bg-gradient-to-br from-neon-500/15 to-transparent p-4">
        <p className="text-[11px] font-black tracking-wide text-neon-300">공유받은 셋리스트</p>
        <h1 className="mt-1 text-[22px] font-black text-white">오늘 부를 {songs.length}곡</h1>
        <p className="muted mt-1">아래 번호 그대로 노래방에서 입력하면 돼요.</p>
      </div>
      <div className="panel divide-y divide-white/[0.06] p-1.5">
        {songs.map((song, i) => (
          <div key={song.id} className="flex items-center gap-3 px-2 py-2.5">
            <span className="w-6 text-center font-mono text-[13px] font-black text-lime-300">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-bold text-white">{song.title}</p>
              <p className="truncate text-[12px] text-zinc-400">{song.singer}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <NumberBadge brand="TJ" no={song.tj} />
              <NumberBadge brand="KY" no={song.ky} />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          importSetlist(songs);
          setDone(true);
          toast('내 셋리스트에 담았어요');
        }}
        className={done ? 'btn-soft w-full' : 'btn-primary w-full'}
      >
        {done ? '내 셋리스트에 담김' : '이 셋리스트 내 걸로 담기'}
      </button>
    </div>
  );
}
