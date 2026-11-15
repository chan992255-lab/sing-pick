import { useEffect, useState } from 'react';
import { Heart, Home as HomeIcon, ListMusic, Mic, Search as SearchIcon, Shuffle } from 'lucide-react';
import type { Song } from './data/songs';
import { useStore } from './lib/store';
import { decodeSetlist } from './lib/share';
import { BrandMark } from './components/BrandMark';
import { Home } from './components/Home';
import { SearchView } from './components/SearchView';
import { RouletteView } from './components/RouletteView';
import { SetlistView, SharedSetlist } from './components/SetlistView';
import { LibraryView } from './components/LibraryView';
import { QuizView } from './components/QuizView';
import { StudioView } from './components/StudioView';
import { SongSheet } from './components/SongSheet';
import { Toast } from './components/ui';

type Route = 'home' | 'search' | 'roulette' | 'setlist' | 'library' | 'quiz' | 'studio';

const NAV: { key: Route; label: string; icon: typeof HomeIcon }[] = [
  { key: 'home', label: '홈', icon: HomeIcon },
  { key: 'search', label: '검색', icon: SearchIcon },
  { key: 'roulette', label: '룰렛', icon: Shuffle },
  { key: 'setlist', label: '셋리스트', icon: ListMusic },
  { key: 'library', label: '보관함', icon: Heart },
];

function parseHash(): { route: Route; share: string | null } {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('share=')) return { route: 'home', share: hash.slice(6) };
  const name = hash.replace(/^\//, '') as Route;
  const known: Route[] = ['home', 'search', 'roulette', 'setlist', 'library', 'quiz', 'studio'];
  return { route: known.includes(name) ? name : 'home', share: null };
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash().route);
  const [shareCode, setShareCode] = useState<string | null>(() => parseHash().share);
  const [sheetSong, setSheetSong] = useState<Song | null>(null);
  const [studioSong, setStudioSong] = useState<Song | null>(null);
  const { setlistSongs } = useStore();

  useEffect(() => {
    const onHash = () => {
      const parsed = parseHash();
      setRoute(parsed.route);
      setShareCode(parsed.share);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (next: Route) => {
    window.location.hash = next === 'home' ? '/' : `/${next}`;
  };

  const openSong = (song: Song) => setSheetSong(song);

  const goStudio = (song?: Song) => {
    setStudioSong(song ?? null);
    setSheetSong(null);
    navigate('studio');
  };

  if (shareCode) {
    const shared = decodeSetlist(shareCode);
    return (
      <div className="app-bg min-h-screen">
        <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-[calc(var(--safe-t)+16px)]">
          <header className="mb-4 flex items-center justify-between">
            <a href="#/" className="flex items-center gap-2">
              <BrandMark className="h-8 w-8 shrink-0" />
              <span className="text-[17px] font-black tracking-tight text-white">싱픽</span>
            </a>
            <a href="#/" className="btn-soft px-3 py-1.5 text-[12px]">
              싱픽 시작하기
            </a>
          </header>
          <SharedSetlist songs={shared} />
        </div>
        <Toast />
      </div>
    );
  }

  return (
    <div className="app-bg min-h-screen">
      <div className="mx-auto w-full max-w-2xl px-4 pb-[calc(var(--nav-h)+var(--safe-b)+20px)] pt-[calc(var(--safe-t)+12px)]">
        <header className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => navigate('home')} className="flex items-center gap-2">
            <BrandMark className="h-9 w-9 shrink-0" />
            <span className="text-[18px] font-black leading-none tracking-tight text-white">싱픽</span>
          </button>
          <div className="flex items-center gap-1.5">
            {setlistSongs.length ? (
              <button
                type="button"
                onClick={() => navigate('setlist')}
                className="rounded-full border border-lime-400/30 bg-lime-400/10 px-2.5 py-1.5 text-[11px] font-bold text-lime-300"
              >
                셋리스트 {setlistSongs.length}
              </button>
            ) : null}
            <button
              type="button"
              aria-label="녹음 스튜디오"
              onClick={() => goStudio()}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white"
            >
              <Mic size={16} />
            </button>
          </div>
        </header>

        <main>
          {route === 'home' ? <Home onOpenSong={openSong} onNavigate={(r) => navigate(r)} /> : null}
          {route === 'search' ? <SearchView onOpenSong={openSong} /> : null}
          {route === 'roulette' ? <RouletteView onOpenSong={openSong} /> : null}
          {route === 'setlist' ? <SetlistView onOpenSong={openSong} onNavigate={(r) => navigate(r)} /> : null}
          {route === 'library' ? (
            <LibraryView onOpenSong={openSong} onGoStudio={(song) => goStudio(song)} />
          ) : null}
          {route === 'quiz' ? <QuizView onOpenSong={openSong} /> : null}
          {route === 'studio' ? (
            <StudioView song={studioSong} onBack={() => navigate('home')} onOpenSong={openSong} />
          ) : null}
        </main>
      </div>

      {route !== 'studio' ? (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-ink-950/90 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-2xl items-stretch px-2 pb-[var(--safe-b)]">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = route === item.key || (item.key === 'home' && route === 'quiz');
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.key)}
                  className={`tab-pill ${active ? 'text-white' : 'text-zinc-500'}`}
                >
                  <span className={`grid h-7 w-10 place-items-center rounded-full transition ${active ? 'bg-white/10' : ''}`}>
                    <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}

      <SongSheet song={sheetSong} open={Boolean(sheetSong)} onClose={() => setSheetSong(null)} onRecord={goStudio} />
      <Toast />
    </div>
  );
}
