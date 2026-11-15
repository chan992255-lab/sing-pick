// 검색용 문자열 정규화와 초성 처리

const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

/** '사건의 지평선' -> 'ㅅㄱㅇㅈㅍㅅ' */
export function toChosung(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      out += CHOSUNG[Math.floor((code - 0xac00) / 588)];
    } else if (/[a-z0-9]/i.test(ch)) {
      out += ch.toLowerCase();
    }
  }
  return out;
}

export function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s()[\]{}'",.·:;!?~\-_&+/]/g, '');
}

export function isChosung(text: string): boolean {
  return /^[ㄱ-ㅎ]+$/.test(text.replace(/\s/g, ''));
}

export function formatDate(iso: string | number): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0KB';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export const MOODS = [
  { key: 's', label: '혼코노', emoji: '🎧', desc: '혼자서 감성 터뜨리기' },
  { key: 'f', label: '친구들이랑', emoji: '🙌', desc: '다 같이 신나게' },
  { key: 'h', label: '떼창·분위기 UP', emoji: '🔥', desc: '마이크 놓기 금지' },
  { key: 'd', label: '썸·데이트', emoji: '💗', desc: '설렘 충전' },
  { key: 'g', label: '고음 해소', emoji: '😤', desc: '스트레스 삭제' },
  { key: 'p', label: '회식·가족', emoji: '🍻', desc: '세대 통합' },
] as const;

export const GENRES = [
  { key: 'ballad', label: '발라드' },
  { key: 'dance', label: '댄스·아이돌' },
  { key: 'hiphop', label: '힙합' },
  { key: 'rnb', label: 'R&B' },
  { key: 'rock', label: '록·밴드' },
  { key: 'trot', label: '트로트' },
  { key: 'indie', label: '인디' },
  { key: 'oldpop', label: '팝송' },
] as const;

export function genreLabel(key: string): string {
  return GENRES.find((g) => g.key === key)?.label ?? '기타';
}

export function moodLabel(key: string): string {
  return MOODS.find((m) => m.key === key)?.label ?? '';
}

export function vocalLabel(v: number): string {
  if (v >= 5) return '고음 지옥';
  if (v === 4) return '고음 도전';
  if (v === 3) return '무난';
  if (v === 2) return '편안';
  return '쉬움';
}
