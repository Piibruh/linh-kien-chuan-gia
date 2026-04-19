import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const applyThemeClass = (theme: Theme) => {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.body.classList.toggle('dark', isDark);
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',

      setTheme: (theme: Theme) => {
        set({ theme });
        applyThemeClass(theme);
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'electro-theme',
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state?.theme === 'dark') {
          applyThemeClass('dark');
        } else {
          applyThemeClass('light');
        }
      },
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('electro-theme');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.state?.theme === 'dark') {
        applyThemeClass('dark');
      } else {
        applyThemeClass('light');
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}
