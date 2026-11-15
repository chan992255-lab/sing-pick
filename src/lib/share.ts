import type { Song } from '../data/songs';

interface PackedSong {
  t: string;
  s: string;
  tj: string;
  ky: string;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code: string): Uint8Array {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function encodeSetlist(songs: Song[]): string {
  const packed: PackedSong[] = songs.map((s) => ({ t: s.title, s: s.singer, tj: s.tj, ky: s.ky }));
  return toBase64Url(new TextEncoder().encode(JSON.stringify(packed)));
}

export function decodeSetlist(code: string): Song[] {
  try {
    const json = new TextDecoder().decode(fromBase64Url(code));
    const packed = JSON.parse(json) as PackedSong[];
    if (!Array.isArray(packed)) return [];
    return packed
      .filter((p) => p && p.t)
      .map((p, i) => ({
        id: `shared:${i}:${p.t}`,
        title: String(p.t),
        singer: String(p.s ?? ''),
        tj: String(p.tj ?? ''),
        ky: String(p.ky ?? ''),
        genre: 'dance' as const,
        moods: [],
        era: 2020,
        vocal: 3,
        heat: 50,
      }));
  } catch {
    return [];
  }
}

export function shareUrl(songs: Song[]): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#share=${encodeSetlist(songs)}`;
}
