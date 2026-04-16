import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { getLanguage, Language, setLanguage, t, TranslationKey } from '../services/i18n';

interface LanguageContextValue {
  language: Language;
  changeLanguage: (language: Language) => void;
  translate: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }): JSX.Element {
  const [language, setCurrentLanguage] = useState<Language>(getLanguage());

  const value = useMemo(
    () => ({
      language,
      changeLanguage: (nextLanguage: Language): void => {
        setCurrentLanguage(nextLanguage);
        setLanguage(nextLanguage);
      },
      translate: (key: TranslationKey): string => t(language, key)
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider.');
  }
  return context;
}
