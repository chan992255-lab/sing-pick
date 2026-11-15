// 서버리스 함수(/api/*)와 이야기하는 클라이언트 쪽 코드.
// 외부 노래방 사이트는 CORS 를 열어 주지 않으므로, 브라우저는 항상 우리 서버를 거친다.
// 서버도 외부 사이트가 막히면 내장 DB 로 답하므로, 앱은 "느리면 내장 DB로 먼저 보여 주기"만 하면 된다.

import type { Song } from '../data/songs';

export interface LiveHit {
  title: string;
  singer: string;
  tj: string;
  ky: string;
  source: 'tj' | 'manana' | 'builtin';
}

async function getJson<T>(url: string, timeoutMs = 7000): Promise<T | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** TJ·금영 전체 곡 실시간 검색. 통신 자체가 실패하면 null (화면은 내장 DB 결과로 계속 동작) */
export async function searchLive(query: string): Promise<LiveHit[] | null> {
  const q = query.trim();
  if (q.length < 1) return [];
  const data = await getJson<{ results?: LiveHit[] }>(`/api/search?q=${encodeURIComponent(q)}&limit=24`);
  if (!data || !Array.isArray(data.results)) return null;
  return data.results.filter((r) => r.title);
}

export type ChartKind = 'hot100' | 'hit_song';

export interface ChartHit {
  rank: number;
  title: string;
  singer: string;
  tj: string;
  /** TJ 차트에는 금영 번호가 없어, 서버가 찾아 준 경우에만 채워진다 */
  ky?: string;
}

/** TJ 공식 차트. 실패하면 null → 화면은 내장 큐레이션 차트로 폴백 */
export async function fetchChart(kind: ChartKind): Promise<ChartHit[] | null> {
  const data = await getJson<{ songs?: ChartHit[]; source?: string }>(`/api/chart?type=${kind}`, 8000);
  if (!data?.songs?.length) return null;
  return data.songs;
}

export interface LyricsResult {
  lyrics: string;
  synced: boolean;
  source: 'lrclib' | 'none';
  track?: string;
  artist?: string;
}

export async function fetchLyrics(song: { title: string; singer: string }): Promise<LyricsResult> {
  const url = `/api/lyrics?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.singer)}`;
  const data = await getJson<LyricsResult>(url, 9000);
  if (!data || !data.lyrics) return { lyrics: '', synced: false, source: 'none' };
  return data;
}

/** 실시간 검색 결과를 앱 내부 Song 형태로 바꾼다. */
export function hitToSong(hit: LiveHit, index = 0): Song {
  const slug = `${hit.tj || hit.ky || 'x'}-${index}`;
  return {
    id: `live:${slug}:${hit.title}`,
    title: hit.title,
    singer: hit.singer || '가수 미상',
    tj: hit.tj || '',
    ky: hit.ky || '',
    genre: 'dance',
    moods: [],
    era: 2020,
    vocal: 3,
    heat: 50,
  };
}
