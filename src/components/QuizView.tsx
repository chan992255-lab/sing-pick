import { useMemo, useState } from 'react';
import { Check, Copy, RotateCcw, Share2, Sparkles, Trophy } from 'lucide-react';
import { SONGS, type Song } from '../data/songs';
import { NumberBadge, SectionHeader } from './ui';
import { useStore } from '../lib/store';

interface Option {
  key: string;
  label: string;
  emoji: string;
}

interface Question {
  id: string;
  title: string;
  hint: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 'who',
    title: '오늘 누구랑 왔어요?',
    hint: '함께 온 사람에 따라 부를 곡이 달라져요',
    options: [
      { key: 'solo', label: '혼코노 (나만의 무대)', emoji: '🎧' },
      { key: 'friend', label: '친구들이랑 왁자지껄', emoji: '🙌' },
      { key: 'date', label: '썸·데이트', emoji: '💗' },
      { key: 'party', label: '회식·가족 모임', emoji: '🍻' },
    ],
  },
  {
    id: 'vocal',
    title: '내 고음 자신감은?',
    hint: '솔직하게 골라야 찰떡 곡이 나와요',
    options: [
      { key: 'low', label: '저음~중음이 편해요', emoji: '😌' },
      { key: 'mid', label: '원키로 도전!', emoji: '🙂' },
      { key: 'high', label: '고음 어느 정도 자신 있어요', emoji: '😤' },
      { key: 'crazy', label: '3단 고음도 가능', emoji: '🔥' },
    ],
  },
  {
    id: 'throat',
    title: '지금 목 상태는?',
    hint: '오늘 컨디션에 맞춰 난이도를 조절해요',
    options: [
      { key: 'best', label: '최상 (오늘 다 부를 수 있어)', emoji: '💪' },
      { key: 'normal', label: '보통', emoji: '🙂' },
      { key: 'save', label: '목 아끼는 날 (낮게)', emoji: '🤫' },
    ],
  },
  {
    id: 'tempo',
    title: '끌리는 템포·리듬은?',
    hint: '장르 취향을 반영해요',
    options: [
      { key: 'ballad', label: '잔잔한 발라드', emoji: '🌙' },
      { key: 'groove', label: '그루비한 힙합·R&B', emoji: '🎧' },
      { key: 'dance', label: '신나는 댄스·아이돌', emoji: '💃' },
      { key: 'rock', label: '밴드·록의 시원함', emoji: '🎸' },
    ],
  },
  {
    id: 'position',
    title: '노래방에서 내 포지션은?',
    hint: '당신의 역할을 알려 주세요',
    options: [
      { key: 'hype', label: '분위기 띄우는 떼창러', emoji: '📣' },
      { key: 'emotional', label: '감성에 젖는 몰입러', emoji: '🫧' },
      { key: 'rapper', label: '랩·퍼포먼스 담당', emoji: '🎤' },
      { key: 'vocal', label: '실력파 보컬 담당', emoji: '🎼' },
    ],
  },
  {
    id: 'era',
    title: '끌리는 세대·감성은?',
    hint: '최신곡부터 올타임까지',
    options: [
      { key: 'now', label: '최신 트렌드 (요즘 곡)', emoji: '✨' },
      { key: '2010s', label: '2010s 레전드', emoji: '📀' },
      { key: '90s', label: '90s~올타임 명곡', emoji: '📻' },
      { key: 'trot', label: '트로트·국민가요', emoji: '🌾' },
    ],
  },
  {
    id: 'ending',
    title: '마무리 엔딩 스타일은?',
    hint: '마지막 곡까지 계산에 넣어요',
    options: [
      { key: 'linger', label: '여운 남기는 곡으로 끝내기', emoji: '🌌' },
      { key: 'bang', label: '마지막까지 텐션 폭발', emoji: '🎉' },
    ],
  },
];

interface Character {
  name: string;
  desc: string;
  emoji: string;
}

function pickCharacter(answers: Record<string, string>): Character {
  const { who, position, era, tempo, ending, vocal } = answers;

  if (era === 'trot') {
    return {
      name: '흥이 넘치는 트로트 스타',
      desc: '장윤정부터 영탁까지, 한 곡만 틀면 온 가족이 마이크를 잡는 흥부자예요.',
      emoji: '🌾',
    };
  }
  if (position === 'rapper') {
    return {
      name: '마이크 잡으면 랩 머신',
      desc: '박자만 들리면 가사가 튀어나오는 타입. 힙합만 골라 드렸어요.',
      emoji: '🎤',
    };
  }
  if (position === 'vocal' && (vocal === 'high' || vocal === 'crazy')) {
    return {
      name: '고음 지옥도 웃으며 넘는 보컬 머신',
      desc: '후렴만 기다렸다가 시원하게 뚫어 주는, 노래방에서 제일 부러운 목이에요.',
      emoji: '🎼',
    };
  }
  if (who === 'date') {
    return {
      name: '설렘 충전 러브송 큐레이터',
      desc: '적당한 온도로 분위기를 데우는 선곡 센스. 오늘도 설렘 한 스푼.',
      emoji: '💗',
    };
  }
  if (position === 'hype' && (ending === 'bang' || tempo === 'dance')) {
    return {
      name: '분위기 올킬 떼창 대장',
      desc: '이 사람이 마이크를 들면 다 같이 일어나게 되는, 노래방의 지배자예요.',
      emoji: '📣',
    };
  }
  if (position === 'emotional' || tempo === 'ballad') {
    return {
      name: '새벽 감성 찢는 발라드 장인',
      desc: '조용히 시작해 마지막 소절에서 모두를 조용하게 만드는 감성 장인.',
      emoji: '🌙',
    };
  }
  if (era === '90s' || era === '2010s') {
    return {
      name: '올타임 레전드 소환사',
      desc: '그 시절 노래가 나오면 세대를 뛰어넘어 떼창이 시작되는 타입.',
      emoji: '📻',
    };
  }
  return {
    name: '요즘 노래 다 아는 트렌드 세터',
    desc: '신곡이 나오면 일주일 안에 노래방에서 부르는, 가장 빠른 사람이에요.',
    emoji: '✨',
  };
}

const GENRE_WEIGHTS: Record<string, string[]> = {
  ballad: ['ballad', 'rnb'],
  groove: ['hiphop', 'rnb'],
  dance: ['dance'],
  rock: ['rock'],
};

function recommend(answers: Record<string, string>): Song[] {
  const vocalBase = { low: 1.8, mid: 3, high: 4.2, crazy: 5 }[answers.vocal ?? 'mid'] ?? 3;
  const vocalShift = { best: 0.5, normal: 0, save: -0.8 }[answers.throat ?? 'normal'] ?? 0;
  const targetVocal = Math.max(1, Math.min(5, vocalBase + vocalShift));

  const moodTag = { solo: 's', friend: 'f', date: 'd', party: 'p' }[answers.who ?? 'friend'] ?? 'f';
  const genres = GENRE_WEIGHTS[answers.tempo ?? 'ballad'] ?? [];
  const posTag = answers.position === 'hype' ? 'h' : answers.position === 'emotional' ? 's' : answers.position === 'vocal' ? 'g' : null;

  const eraWanted =
    answers.era === 'now' ? 2020 : answers.era === '2010s' ? 2010 : answers.era === '90s' ? 1980 : null;

  const scored = SONGS.map((song) => {
    let score = song.heat / 9;
    score -= Math.abs(song.vocal - targetVocal) * 5.5;

    if (song.moods.includes(moodTag as never)) score += 13;
    if (posTag && song.moods.includes(posTag as never)) score += 8;
    if (genres.includes(song.genre)) score += 12;

    if (answers.era === 'trot') {
      score += song.genre === 'trot' ? 22 : -6;
    } else if (eraWanted === 2020) {
      score += song.era === 2020 ? 10 : song.era === 2010 ? 3 : -3;
    } else if (eraWanted === 2010) {
      score += song.era === 2010 ? 10 : song.era === 2020 ? 2 : 0;
    } else if (eraWanted === 1980) {
      score += song.era <= 2010 ? 9 : -2;
    }

    if (answers.ending === 'bang') {
      score += ['dance', 'rock'].includes(song.genre) ? 7 : 0;
      score += song.heat / 30;
    } else {
      score += ['ballad', 'rnb'].includes(song.genre) ? 6 : 0;
      score -= song.vocal >= 5 ? 3 : 0;
    }

    if (answers.position === 'rapper') {
      score += song.genre === 'hiphop' ? 18 : song.genre === 'rnb' ? 5 : -4;
    }
    if (answers.position === 'vocal' && song.vocal >= 4) score += 7;
    if (answers.position === 'hype' && song.heat >= 85) score += 5;

    return { song, score };
  }).sort((a, b) => b.score - a.score);

  const picked: Song[] = [];
  const artists = new Set<string>();
  for (const { song } of scored) {
    if (picked.length >= 5) break;
    if (artists.has(song.singer)) continue;
    picked.push(song);
    artists.add(song.singer);
  }
  return picked;
}

export function QuizView({ onOpenSong }: { onOpenSong: (song: Song) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToSetlist, addFavorite, favorites, importSetlist, toast } = useStore();

  const character = useMemo(() => pickCharacter(answers), [answers]);
  const results = useMemo(() => (done ? recommend(answers) : []), [done, answers]);
  const current = QUESTIONS[step];

  const shareText = useMemo(() => {
    const lines = [
      `🎤 싱픽 노래방 성향 테스트 결과`,
      `나의 캐릭터: ${character.emoji} ${character.name}`,
      character.desc,
      '',
      '오늘의 추천 5곡',
      ...results.map(
        (s, i) => `${i + 1}. ${s.title} - ${s.singer} (TJ ${s.tj || '-'} / KY ${s.ky || '-'})`,
      ),
      '',
      '나도 테스트하기 → https://sing-pick.vercel.app/#/quiz',
    ];
    return lines.join('\n');
  }, [character, results]);

  const restart = () => {
    setStep(0);
    setAnswers({});
    setDone(false);
    setCopied(false);
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast('결과를 복사했어요. 친구에게 붙여 넣어 보세요!');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('복사가 막혀 있어요. 텍스트를 길게 눌러 복사해 주세요.');
    }
  };

  const shareResult = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: '싱픽 노래방 성향 테스트', text: shareText });
      } else {
        await copyResult();
      }
    } catch {
      /* 사용자가 취소 */
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title="나만의 18번 찾기" desc="7문항 성향 테스트로 오늘의 5곡을 골라 드려요" />

      {!done ? (
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-1">
            {QUESTIONS.map((q, i) => (
              <span key={q.id} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-lime-400' : 'bg-white/10'}`} />
            ))}
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-[11.5px] font-bold text-lime-300">
              Q{step + 1} / {QUESTIONS.length}
            </p>
            {Object.keys(answers).length && step === QUESTIONS.length - 1 ? null : (
              <p className="text-[11px] text-zinc-500">{current.hint}</p>
            )}
          </div>
          <h2 className="mt-1 text-[19px] font-black text-white">{current.title}</h2>
          <div className="mt-4 space-y-2">
            {current.options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, [current.id]: opt.key }));
                  if (step + 1 >= QUESTIONS.length) setDone(true);
                  else setStep(step + 1);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:border-neon-400/50 hover:bg-white/[0.08] active:scale-[0.99]"
              >
                <span className="text-[18px]">{opt.emoji}</span>
                <span className="text-[13.5px] font-bold text-white">{opt.label}</span>
              </button>
            ))}
          </div>
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="mt-3 text-[11.5px] text-zinc-500">
              ← 이전 질문
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="panel relative overflow-hidden bg-gradient-to-br from-lime-400/12 via-transparent to-neon-500/15 p-5">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime-400/20 blur-3xl" />
            <p className="relative flex items-center gap-1 text-[11px] font-black tracking-wide text-lime-300">
              <Sparkles size={12} /> 나의 노래방 캐릭터
            </p>
            <p className="relative mt-2 text-[30px] leading-none">{character.emoji}</p>
            <h2 className="relative mt-2 text-[22px] font-black leading-tight text-white">{character.name}</h2>
            <p className="relative mt-1.5 text-[13px] leading-relaxed text-zinc-300">{character.desc}</p>
            <div className="relative mt-3 flex flex-wrap gap-1.5">
              {[
                QUESTIONS[0].options.find((o) => o.key === answers.who)?.label,
                QUESTIONS[1].options.find((o) => o.key === answers.vocal)?.label,
                QUESTIONS[3].options.find((o) => o.key === answers.tempo)?.label,
                QUESTIONS[5].options.find((o) => o.key === answers.era)?.label,
              ]
                .filter(Boolean)
                .map((label) => (
                  <span key={String(label)} className="rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] font-bold text-zinc-200">
                    {label}
                  </span>
                ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={copyResult} className="btn-soft flex-1 text-[12.5px]">
              {copied ? <Check size={14} /> : <Copy size={14} />} 결과 복사
            </button>
            <button type="button" onClick={shareResult} className="btn-lime flex-1 text-[12.5px]">
              <Share2 size={14} /> 공유하기
            </button>
          </div>

          <SectionHeader title="오늘의 추천 5곡" desc="성향·음역대·컨디션을 모두 반영했어요" />
          {results.map((song, i) => (
            <div key={song.id} className="panel p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime-400/15 text-[13px] font-black text-lime-300">
                  {i + 1}
                </span>
                <button type="button" onClick={() => onOpenSong(song)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[16px] font-black text-white">{song.title}</p>
                  <p className="truncate text-[12.5px] text-zinc-400">{song.singer}</p>
                  <div className="mt-1.5 flex gap-1.5">
                    <NumberBadge brand="TJ" no={song.tj} />
                    {song.ky ? <NumberBadge brand="KY" no={song.ky} /> : null}
                  </div>
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => addToSetlist(song)} className="btn-lime flex-1 py-2 text-[12px]">
                  셋리스트 담기
                </button>
                <button
                  type="button"
                  onClick={() => (favorites[song.id] ? onOpenSong(song) : addFavorite(song))}
                  className="btn-soft flex-1 py-2 text-[12px]"
                >
                  {favorites[song.id] ? '애창곡에 있음' : '애창곡 담기'}
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              importSetlist(results);
            }}
            className="btn-primary w-full text-[13px]"
          >
            추천 5곡 한 번에 셋리스트에 담기
          </button>

          <button type="button" onClick={restart} className="btn-soft w-full text-[12.5px]">
            <RotateCcw size={14} /> 다시 테스트하기
          </button>
        </div>
      )}

      <div className="panel flex items-center gap-3 p-4">
        <Trophy size={18} className="shrink-0 text-hot-400" />
        <p className="muted">
          테스트는 내장 애창곡 180곡에서 고릅니다. 결과는 저장되지 않으니 마음에 들면 꼭 담아 두세요.
        </p>
      </div>
    </div>
  );
}
