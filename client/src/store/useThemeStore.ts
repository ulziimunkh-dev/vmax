import { create } from 'zustand';

type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const getInitialMode = (): ThemeMode => {
  const saved = localStorage.getItem('vmax_theme') as ThemeMode;
  if (saved) return saved;
  // Default to 'light' since user requested a bright, non-dark design default
  return 'light';
};

const applyThemeClass = (theme: ThemeMode) => {
  if (typeof document !== 'undefined') {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }
};

const initialMode = getInitialMode();
applyThemeClass(initialMode);

export const useThemeStore = create<ThemeState>((set) => ({
  mode: initialMode,
  toggleTheme: () => set((state) => {
    const nextMode = state.mode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('vmax_theme', nextMode);
    applyThemeClass(nextMode);
    return { mode: nextMode };
  }),
  setMode: (mode) => {
    localStorage.setItem('vmax_theme', mode);
    applyThemeClass(mode);
    set({ mode });
  },
}));
