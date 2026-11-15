import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { SONGS, type Song } from '../data/songs';

export interface FavoriteMeta {
  /** 내 키 (-6 ~ +6) */
  key: number;
  /** 내 템포 (-20% ~ +20%) */
  tempo: number;
  memo: string;
  /** 부른 횟수 */
  count: number;
  /** 담은 시각 */
  at: number;
}

interface Persisted {
  favorites: Record<string, FavoriteMeta>;
  setlist: string[];
  customSongs: Record<string, Song>;
  recents: string[];
}

const EMPTY: Persisted = { favorites: {}, setlist: [], customSongs: {}, recents: [] };
const STORAGE_KEY = 'singpick.v1';

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      favorites: parsed.favorites ?? {},
      setlist: Array.isArray(parsed.setlist) ? parsed.setlist : [],
      customSongs: parsed.customSongs ?? {},
      recents: Array.isArray(parsed.recents) ? parsed.recents : [],
    };
  } catch {
    return EMPTY;
  }
}

interface StoreValue extends Persisted {
  getSong: (id: string) => Song | undefined;
  favoriteSongs: Song[];
  setlistSongs: Song[];
  addFavorite: (song: Song) => void;
  removeFavorite: (id: string) => void;
  updateFavorite: (id: string, patch: Partial<FavoriteMeta>) => void;
  bumpCount: (id: string) => void;
  toggleSetlist: (song: Song) => void;
  addToSetlist: (song: Song) => void;
  removeFromSetlist: (id: string) => void;
  moveInSetlist: (id: string, dir: -1 | 1) => void;
  clearSetlist: () => void;
  importSetlist: (songs: Song[]) => void;
  rememberRecent: (id: string) => void;
  recentSongs: Song[];
  toast: (message: string) => void;
  toastMessage: string | null;
}

const StoreContext = createContext<StoreValue | null>(null);

const BUILT_IN = new Map(SONGS.map((s) => [s.id, s]));

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => load());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* 저장 공간이 꽉 차도 앱은 계속 동작해야 한다 */
    }
  }, [state]);

  const rememberCustom = useCallback((song: Song) => {
    if (BUILT_IN.has(song.id)) return undefined;
    setState((prev) =>
      prev.customSongs[song.id] ? prev : { ...prev, customSongs: { ...prev.customSongs, [song.id]: song } },
    );
    return song;
  }, []);

  const getSong = useCallback(
    (id: string) => BUILT_IN.get(id) ?? state.customSongs[id],
    [state.customSongs],
  );

  const toast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2200);
  }, []);

  const addFavorite = useCallback(
    (song: Song) => {
      rememberCustom(song);
      setState((prev) => {
        if (prev.favorites[song.id]) return prev;
        return {
          ...prev,
          favorites: {
            ...prev.favorites,
            [song.id]: { key: 0, tempo: 0, memo: '', count: 0, at: Date.now() },
          },
        };
      });
      toast('애창곡에 담았어요 🎤');
    },
    [rememberCustom, toast],
  );

  const removeFavorite = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev.favorites };
      delete next[id];
      return { ...prev, favorites: next };
    });
  }, []);

  const updateFavorite = useCallback(
    (id: string, patch: Partial<FavoriteMeta>) => {
      setState((prev) => {
        const current = prev.favorites[id];
        if (!current) return prev;
        return { ...prev, favorites: { ...prev.favorites, [id]: { ...current, ...patch } } };
      });
    },
    [],
  );

  const bumpCount = useCallback((id: string) => {
    setState((prev) => {
      const current = prev.favorites[id];
      if (!current) return prev;
      return {
        ...prev,
        favorites: { ...prev.favorites, [id]: { ...current, count: current.count + 1 } },
      };
    });
  }, []);

  const addToSetlist = useCallback(
    (song: Song) => {
      rememberCustom(song);
      setState((prev) =>
        prev.setlist.includes(song.id) ? prev : { ...prev, setlist: [...prev.setlist, song.id] },
      );
      toast('오늘의 셋리스트에 추가했어요 📝');
    },
    [rememberCustom, toast],
  );

  const removeFromSetlist = useCallback((id: string) => {
    setState((prev) => ({ ...prev, setlist: prev.setlist.filter((x) => x !== id) }));
  }, []);

  const toggleSetlist = useCallback(
    (song: Song) => {
      rememberCustom(song);
      setState((prev) => {
        if (prev.setlist.includes(song.id)) {
          return { ...prev, setlist: prev.setlist.filter((x) => x !== song.id) };
        }
        return { ...prev, setlist: [...prev.setlist, song.id] };
      });
    },
    [rememberCustom],
  );

  const moveInSetlist = useCallback((id: string, dir: -1 | 1) => {
    setState((prev) => {
      const i = prev.setlist.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.setlist.length) return prev;
      const next = [...prev.setlist];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...prev, setlist: next };
    });
  }, []);

  const clearSetlist = useCallback(() => setState((prev) => ({ ...prev, setlist: [] })), []);

  const importSetlist = useCallback(
    (songs: Song[]) => {
      setState((prev) => {
        const custom = { ...prev.customSongs };
        const merged = [...prev.setlist];
        for (const song of songs) {
          if (!BUILT_IN.has(song.id)) custom[song.id] = song;
          if (!merged.includes(song.id)) merged.push(song.id);
        }
        return { ...prev, setlist: merged, customSongs: custom };
      });
      toast(`${songs.length}곡을 내 셋리스트에 담았어요`);
    },
    [toast],
  );

  const rememberRecent = useCallback((id: string) => {
    setState((prev) => {
      if (prev.recents[0] === id) return prev;
      return { ...prev, recents: [id, ...prev.recents.filter((x) => x !== id)].slice(0, 12) };
    });
  }, []);

  const favoriteSongs = useMemo(
    () =>
      Object.keys(state.favorites)
        .sort((a, b) => state.favorites[b].at - state.favorites[a].at)
        .map((id) => getSong(id))
        .filter((s): s is Song => Boolean(s)),
    [state.favorites, getSong],
  );

  const setlistSongs = useMemo(
    () => state.setlist.map((id) => getSong(id)).filter((s): s is Song => Boolean(s)),
    [state.setlist, getSong],
  );

  const recentSongs = useMemo(
    () => state.recents.map((id) => getSong(id)).filter((s): s is Song => Boolean(s)),
    [state.recents, getSong],
  );

  const value: StoreValue = {
    ...state,
    getSong,
    favoriteSongs,
    setlistSongs,
    addFavorite,
    removeFavorite,
    updateFavorite,
    bumpCount,
    toggleSetlist,
    addToSetlist,
    removeFromSetlist,
    moveInSetlist,
    clearSetlist,
    importSetlist,
    rememberRecent,
    recentSongs,
    toast,
    toastMessage,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore 는 StoreProvider 안에서만 쓸 수 있습니다.');
  return ctx;
}
