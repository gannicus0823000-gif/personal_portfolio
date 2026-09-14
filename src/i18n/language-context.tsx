import { useCallback, useEffect, useMemo, useState } from 'react';
import { LanguageContext } from './language-store';
import {
  formatMessage,
  LANGUAGE_STORAGE_KEY,
  Language,
  TranslationKey,
  translations,
} from './translations';

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'zh';
  }

  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (saved === 'zh' || saved === 'en') {
    return saved;
  }

  return 'zh';
};

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const template = translations[language][key];
      return vars ? formatMessage(template, vars) : template;
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
