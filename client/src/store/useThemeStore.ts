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

export const useThemeStore = create<ThemeState>((set) => ({
  mode: getInitialMode(),
  toggleTheme: () => set((state) => {
    const nextMode = state.mode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('vmax_theme', nextMode);
    if (nextMode === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    return { mode: nextMode };
  }),
  setMode: (mode) => {
    localStorage.setItem('vmax_theme', mode);
    if (mode === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    set({ mode });
  },
}));
