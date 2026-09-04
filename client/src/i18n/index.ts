import { create } from 'zustand';
import mn from './mn';
import en from './en';
import type { Translations } from './mn';

type Lang = 'mn' | 'en';
const translations: Record<Lang, Translations> = { mn, en };

interface I18nState {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
}

const initialLang = (localStorage.getItem('vmax_lang') as Lang) || 'mn';
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

export const useI18n = create<I18nState>((set) => ({
  lang: initialLang,
  t: translations[initialLang],
  setLang: (lang) => {
    localStorage.setItem('vmax_lang', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    set({ lang, t: translations[lang] });
  },
}));
