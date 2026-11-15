import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Loader2, Play, RotateCcw, Square } from 'lucide-react';
import type { Song } from '../data/songs';
import { lineIndexAt, useLyrics } from '../lib/lyrics';
import { formatDuration } from '../lib/format';

/**
 * 노래방처럼 녹음하면서 보는 가사 무대.
 * - 싱크 가사가 있으면 녹음 경과 시간에 맞춰 지금 소절을 크게 강조하고 자동 스크롤한다.
 * - 타임코드가 없으면 읽기 좋은 큰 가사로 보여 주고, 가사가 없을 때만 검색 링크를 준다.
 * - '미리보기'를 누르면 녹음 없이도 하이라이트가 흘러가서 연습·확인용으로 쓸 수 있다.
 */
export function LyricsStage({
  song,
  elapsed,
  recording,
}: {
  song: Song;
  /** 녹음 경과 초 (일시정지 시간 제외) */
  elapsed: number;
  /** 녹음 중인지 */
  recording: boolean;
}) {
  const { loading, lyrics, lines, synced, songDuration, failed } = useLyrics(song);
  const [offset, setOffset] = useState(0);
  const [preview, setPreview] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const end = useMemo(() => {
    const lastLine = lines.length ? lines[lines.length - 1].t : 0;
    return Math.max(12, songDuration ?? lastLine + 5);
  }, [lines, songDuration]);

  // 미리보기: 녹음 없이 하이라이트를 끝까지 흘려 본다
  useEffect(() => {
    if (!preview || !synced) return undefined;
    let raf = 0;
    let start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      if (t >= end) {
        start = performance.now();
        setPreviewTime(0);
      } else {
        setPreviewTime(t);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [preview, synced, end]);

  // 녹음이 시작되면 미리보기는 끈다
  useEffect(() => {
    if (recording) setPreview(false);
  }, [recording]);

  const time = Math.max(0, (preview ? previewTime : elapsed) + offset);
  const activeIdx = lineIndexAt(lines, time);
  const progress = Math.min(1, time / end);

  useEffect(() => {
    if (!synced) return;
    const box = listRef.current;
    if (!box) return;
    if (activeIdx < 0) {
      box.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = lineRefs.current[activeIdx];
    if (!el) return;
    const target = el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2;
    box.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [activeIdx, synced]);

  const naver = `https://search.naver.com/search.naver?query=${encodeURIComponent(`${song.singer} ${song.title} 가사`)}`;
  const nudge = (delta: number) => setOffset((prev) => Math.max(-8, Math.min(8, Math.round((prev + delta) * 10) / 10)));

  return (
    <section className="panel relative overflow-hidden p-4">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-neon-500/15 blur-3xl" />

      <div className="relative mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[13.5px] font-extrabold text-white">가사</h3>
          {synced ? (
            <span className="rounded-full bg-lime-400/15 px-2 py-0.5 text-[10.5px] font-bold text-lime-300">노래방 싱크</span>
          ) : null}
          {recording ? (
            <span className="animate-pulse rounded-full bg-hot-500/20 px-2 py-0.5 text-[10.5px] font-black text-hot-400">● LIVE</span>
          ) : null}
        </div>
        <span className="font-mono text-[11px] tabular-nums text-zinc-500">
          {formatDuration(time)} / {formatDuration(end)}
        </span>
      </div>

      {synced ? (
        <div className="relative mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => nudge(-1)} className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10.5px] font-bold text-zinc-300">
              싱크 -1초
            </button>
            <button type="button" onClick={() => nudge(1)} className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10.5px] font-bold text-zinc-300">
              +1초
            </button>
            {offset !== 0 ? (
              <button type="button" onClick={() => setOffset(0)} className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10.5px] font-bold text-zinc-400">
                <RotateCcw size={10} /> {offset > 0 ? '+' : ''}
                {offset.toFixed(1)}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            disabled={recording}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold transition disabled:opacity-40 ${
              preview ? 'bg-lime-400 text-ink-950' : 'border border-white/10 bg-white/5 text-zinc-300'
            }`}
          >
            {preview ? <Square size={10} /> : <Play size={10} />} {preview ? '미리보기 정지' : '미리보기'}
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[12.5px] text-zinc-400">
          <Loader2 size={14} className="animate-spin" /> 가사를 찾는 중…
        </div>
      ) : failed ? (
        <div className="py-3">
          <p className="text-[13.5px] font-bold text-white">등록된 가사를 찾지 못했어요.</p>
          <p className="muted mt-1">
            공개 가사 DB(LRCLIB)에 이 곡이 아직 없거나 표기가 달라 못 찾았어요. 가사를 지어내지 않고 그대로 알려드릴게요.
          </p>
          <a href={naver} target="_blank" rel="noreferrer" className="btn-soft mt-3 w-full text-[12.5px]">
            <ExternalLink size={14} /> 네이버에서 가사 바로 검색
          </a>
        </div>
      ) : synced ? (
        <>
          <div
            ref={listRef}
            data-testid="karaoke-lyrics"
            className="no-scrollbar relative h-[min(46vh,300px)] overflow-y-auto pt-[110px] pb-[120px] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)] [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
          >
            {lines.map((line, i) => {
              const state = i === activeIdx ? 'current' : i < activeIdx ? 'past' : 'next';
              return (
                <p
                  key={`${line.t}-${i}`}
                  ref={(el) => {
                    lineRefs.current[i] = el;
                  }}
                  aria-current={state === 'current' ? 'true' : undefined}
                  data-line-state={state}
                  className={`py-1.5 text-center leading-snug transition-all duration-200 ${
                    state === 'current'
                      ? 'scale-100 text-[22px] font-black text-lime-300 drop-shadow-[0_0_18px_rgba(163,230,53,0.35)]'
                      : state === 'past'
                        ? 'text-[15px] font-bold text-zinc-600'
                        : 'text-[15px] font-bold text-zinc-400'
                  }`}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-neon-400 to-lime-300" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="mt-2 text-[10.5px] text-zinc-500">
            가사 제공: LRCLIB · 싱크가 밀리면 위에서 초 단위로 맞춰 보세요
          </p>
        </>
      ) : (
        <>
          <div className="no-scrollbar h-[min(46vh,300px)] overflow-y-auto">
            <div className="lyrics-body px-1 text-center text-[17px] font-bold text-zinc-200">{lyrics}</div>
          </div>
          <p className="mt-2 text-[10.5px] text-zinc-500">
            이 곡은 타임코드 가사가 없어서 전체 가사를 보여 드려요 · 가사 제공: LRCLIB
          </p>
        </>
      )}
    </section>
  );
}
