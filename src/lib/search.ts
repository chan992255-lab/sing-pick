import type { Song } from '../data/songs';
import { isChosung, normalize, toChosung } from './format';

export type SearchMode = 'all' | 'title' | 'singer' | 'number';

function score(song: Song, query: string, mode: SearchMode): number {
  const q = query.trim();
  if (!q) return 0;
  const nTitle = normalize(song.title);
  const nSinger = normalize(song.singer);
  const nq = normalize(q);
  const chosung = isChosung(q);

  const titleHit = chosung ? toChosung(song.title).includes(q.replace(/\s/g, '')) : nTitle.includes(nq);
  const singerHit = chosung ? toChosung(song.singer).includes(q.replace(/\s/g, '')) : nSinger.includes(nq);
  const numberHit = Boolean(nq) && (song.tj === q.trim() || song.ky === q.trim());

  if (mode === 'title' && !titleHit) return 0;
  if (mode === 'singer' && !singerHit) return 0;
  if (mode === 'number' && !numberHit) return 0;

  let s = 0;
  if (numberHit) s += 100;
  if (nTitle === nq) s += 60;
  else if (titleHit) s += 30;
  if (nSinger === nq) s += 40;
  else if (singerHit) s += 18;
  if (s === 0) return 0;
  return s + song.heat / 10;
}

// 한국어로 부르는 영어 제목 (하입보이 → Hype Boy) 같은 통칭도 찾아 준다.
const TITLE_ALIASES: Record<string, string> = {
  하입보이: 'hype boy',
  디토: 'ditto',
  어텐션: 'attention',
  슈퍼샤이: 'super shy',
  슈퍼노바: 'supernova',
  드라마: 'drama',
  스파이시: 'spicy',
  넥스트레벨: 'next level',
  러브다이브: 'love dive',
  아이엠: 'i am',
  애프터라이크: 'after like',
  톰보이: 'tomboy',
  퀸카: 'queencard',
  앤티프래자일: 'antifragile',
  이지: 'easy',
  퍼펙트나이트: 'perfect night',
  다이너마이트: 'dynamite',
  버터: 'butter',
  뱅뱅뱅: 'bang bang bang',
  판타스틱베이비: 'fantastic baby',
  삐삐: 'bbibbi',
  블루밍: 'blueming',
};

export function searchLocal(songs: Song[], query: string, mode: SearchMode = 'all', limit = 40): Song[] {
  if (!query.trim()) return [];
  const aliasTarget = TITLE_ALIASES[normalize(query)];
  if (aliasTarget) {
    const aliasHits = searchLocal(songs, aliasTarget, mode, limit);
    if (aliasHits.length) return aliasHits;
  }
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const scored = songs
    .map((song) => {
      // 여러 단어면 모든 단어가 어딘가에 걸려야 한다 (예: "아이유 좋은날")
      const tokenScore = tokens.reduce((acc, token) => {
        const one = score(song, token, mode);
        return one ? acc + one : acc - 1000;
      }, 0);
      return { song, s: tokenScore };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map((x) => x.song);
}
