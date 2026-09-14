import { createContext } from 'react';
import { Language, TranslationKey } from './translations';

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
