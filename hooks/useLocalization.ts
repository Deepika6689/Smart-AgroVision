
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Language } from '../types';

// Wrapper hook to maintain backward compatibility with existing components
export const useLocalization = () => {
  const { t, i18n } = useTranslation();
  
  // Local state to force re-render when language changes
  const [currentLang, setCurrentLang] = useState<Language>((i18n.resolvedLanguage || i18n.language || 'en') as Language);

  useEffect(() => {
    const handleLangChange = (lng: string) => {
        // Ensure we only set valid languages from our type
        if (['en', 'hi', 'kn', 'te'].includes(lng)) {
            setCurrentLang(lng as Language);
        } else if (lng.includes('-')) {
             // Handle 'hi-IN' -> 'hi'
            const base = lng.split('-')[0];
            if (['en', 'hi', 'kn', 'te'].includes(base)) {
                setCurrentLang(base as Language);
            }
        }
    };

    i18n.on('languageChanged', handleLangChange);
    
    // Sync initial state just in case
    handleLangChange(i18n.resolvedLanguage || i18n.language);

    return () => {
        i18n.off('languageChanged', handleLangChange);
    };
  }, [i18n]);

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  return { 
    t, 
    language: currentLang, 
    setLanguage 
  };
};
