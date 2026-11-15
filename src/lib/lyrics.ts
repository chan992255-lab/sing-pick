// 가사 불러오기 공용 훅 — 화면 여러 곳에서 같은 곡 가사를 다시 요청하지 않도록 캐시한다.

import { useCallback, useEffect, useState } from 'react';
import { fetchLyrics, type LyricLine } from './api';
import type { Song } from '../data/songs';

export interface LyricsState {
  loading: boolean;
  /** 타임코드를 지운 순수 가사 */
  lyrics: string;
  /** 타임코드가 있는 소절 (2줄 이상일 때만 채운다) */
  lines: LyricLine[];
  synced: boolean;
  /** LRCLIB 에 등록된 곡 길이(초) */
  songDuration: number | null;
  failed: boolean;
}

export type LyricsHook = LyricsState & { reload: () => void };

const EMPTY: LyricsState = { loading: true, lyrics: '', lines: [], synced: false, songDuration: null, failed: false };

const cache = new Map<string, LyricsState>();
/** 같은 곡을 여러 화면에서 동시에 열어도 요청은 한 번만 나가게 한다 */
const pending = new Map<string, Promise<LyricsState>>();

export function useLyrics(song: Song | null): LyricsHook {
  const key = song ? `${song.singer}::${song.title}` : '';
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<LyricsState>(() => (key && cache.get(key)) || EMPTY);

  const reload = useCallback(() => {
    if (key) {
      cache.delete(key);
      pending.delete(key);
    }
    setNonce((n) => n + 1);
  }, [key]);

  useEffect(() => {
    if (!song || !key) {
      setState({ ...EMPTY, loading: false, failed: true });
      return undefined;
    }
    const cached = cache.get(key);
    if (cached) {
      setState(cached);
      return undefined;
    }

    let alive = true;
    setState(EMPTY);
    let task = pending.get(key);
    if (!task) {
      task = fetchLyrics(song)
        .then((res) => {
          const next: LyricsState = {
            loading: false,
            lyrics: res.lyrics,
            lines: res.syncedLines ?? [],
            synced: Boolean(res.synced && (res.syncedLines?.length ?? 0) > 1),
            songDuration: typeof res.duration === 'number' ? res.duration : null,
            failed: !res.lyrics,
          };
          cache.set(key, next);
          return next;
        })
        .catch(() => ({ ...EMPTY, loading: false, failed: true }))
        .finally(() => pending.delete(key));
      pending.set(key, task);
    }
    task.then((next) => {
      if (alive) setState(next);
    });
    return () => {
      alive = false;
    };
  }, [key, song, nonce]);

  return { ...state, reload };
}

/** 지금 시각(초)에 해당하는 소절 번호. 없으면 -1 */
export function lineIndexAt(lines: LyricLine[], time: number): number {
  if (!lines.length) return -1;
  let idx = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].t <= time + 0.01) idx = i;
    else break;
  }
  return idx;
}
