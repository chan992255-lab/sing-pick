import { useMemo, useState } from 'react';
import { RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { SONGS, type Song } from '../data/songs';
import { NumberBadge, SectionHeader } from './ui';
import { useStore } from '../lib/store';

interface Question {
  id: string;
  title: string;
  options: { key: string; label: string; emoji: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'voice',
    title: '오늘 내 목 상태는?',
    options: [
      { key: 'low', label: '쉬고 싶다 · 낮은 곡', emoji: '😌' },
      { key: 'mid', label: '적당히 부를 수 있어요', emoji: '🙂' },
      { key: 'high', label: '고음까지 시원하게', emoji: '😤' },
    ],
  },
  {
    id: 'mood',
    title: '지금 끌리는 분위기',
    options: [
      { key: 's', label: '감성에 젖고 싶어', emoji: '🌙' },
      { key: 'h', label: '신나게 놀고 싶어', emoji: '🔥' },
      { key: 'f', label: '다 같이 떼창', emoji: '🙌' },
    ],
  },
  {
    id: 'who',
    title: '누구랑 왔어요?',
    options: [
      { key: 'solo', label: '혼코노', emoji: '🎧' },
      { key: 'friend', label: '친구들이랑', emoji: '🍻' },
      { key: 'date', label: '썸·데이트', emoji: '💗' },
    ],
  },
];

function recommend(answers: Record<string, string>): Song[] {
  const voice = answers.voice ?? 'mid';
  const mood = answers.mood ?? 's';
  const who = answers.who ?? 'friend';

  const targetVocal = voice === 'low' ? 2 : voice === 'high' ? 4.6 : 3;
  const moodTag = mood === 'f' ? 'f' : mood;
  const whoTag = who === 'solo' ? 's' : who === 'friend' ? 'f' : 'd';

  const scored = SONGS.map((song) => {
    let score = song.heat / 12;
    score -= Math.abs(song.vocal - targetVocal) * 6;
    if (song.moods.includes(moodTag as never)) score += 14;
    if (song.moods.includes(whoTag as never)) score += 10;
    if (who === 'solo' && song.genre === 'ballad') score += 4;
    if (who === 'date' && (song.genre === 'rnb' || song.genre === 'oldpop')) score += 3;
    if (mood === 'h' && (song.genre === 'dance' || song.genre === 'rock')) score += 6;
    return { song, score };
  }).sort((a, b) => b.score - a.score);

  const picked: Song[] = [];
  const usedArtists = new Set<string>();
  for (const { song } of scored) {
    if (picked.length >= 3) break;
    if (usedArtists.has(song.singer)) continue;
    picked.push(song);
    usedArtists.add(song.singer);
  }
  return picked;
}

export function QuizView({ onOpenSong }: { onOpenSong: (song: Song) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const { addToSetlist, addFavorite, favorites } = useStore();

  const results = useMemo(() => (done ? recommend(answers) : []), [done, answers]);
  const current = QUESTIONS[step];

  const restart = () => {
    setStep(0);
    setAnswers({});
    setDone(false);
  };

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title="나만의 18번 찾기" desc="3문항이면 오늘의 노래가 정해져요" />

      {!done ? (
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-1.5">
            {QUESTIONS.map((q, i) => (
              <span
                key={q.id}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-lime-400' : 'bg-white/10'}`}
              />
            ))}
          </div>
          <p className="text-[11.5px] font-bold text-lime-300">
            Q{step + 1} / {QUESTIONS.length}
          </p>
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
          <div className="panel bg-gradient-to-br from-lime-400/10 to-transparent p-4">
            <p className="flex items-center gap-1 text-[11px] font-black tracking-wide text-lime-300">
              <Sparkles size={12} /> 오늘의 18번 후보
            </p>
            <p className="mt-1 text-[12.5px] text-zinc-300">
              목 상태·분위기·함께 온 사람에 맞춰 골랐어요. 마음에 드는 곡을 담아 두세요.
            </p>
          </div>

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
                    <NumberBadge brand="KY" no={song.ky} />
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

          <button type="button" onClick={restart} className="btn-soft w-full text-[12.5px]">
            <RotateCcw size={14} /> 다시 테스트하기
          </button>
        </div>
      )}

      <div className="panel flex items-center gap-3 p-4">
        <Trophy size={18} className="shrink-0 text-hot-400" />
        <p className="muted">
          테스트는 내장 애창곡 큐레이션에서 고릅니다. 결과는 저장되지 않으니 마음에 들면 꼭 담아 두세요.
        </p>
      </div>
    </div>
  );
}
