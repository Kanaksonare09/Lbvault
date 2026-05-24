'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import es from '../locales/es.json';
import pa from '../locales/pa.json';
import mr from '../locales/mr.json';
import ta from '../locales/ta.json';

type Language = 'en' | 'hi' | 'es' | 'pa' | 'mr' | 'ta';

const translations: Record<Language, any> = { en, hi, es, pa, mr, ta };

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && translations[savedLang]) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
