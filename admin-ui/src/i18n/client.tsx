'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Locale, defaultLocale, localeDirection, LOCALE_STORAGE_KEY } from './config';
import { messages } from './messages';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  direction: 'ltr' | 'rtl';
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'he') return 'he';
  return 'en';
}

function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === 'en' || stored === 'he') return stored;
  return null;
}

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  // Initialize locale from storage or browser preference
  useEffect(() => {
    const storedLocale = getStoredLocale();
    const detectedLocale = storedLocale || detectBrowserLocale();
    setLocaleState(detectedLocale);
    setMounted(true);
  }, []);

  // Update HTML attributes when locale changes
  useEffect(() => {
    if (!mounted) return;

    document.documentElement.lang = locale;
    document.documentElement.dir = localeDirection[locale];
  }, [locale, mounted]);

  const setLocale = (newLocale: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    setLocaleState(newLocale);
  };

  const direction = localeDirection[locale];

  // Prevent hydration mismatch by rendering children only after mount
  // But we still render the provider to avoid layout shift
  return (
    <LocaleContext.Provider value={{ locale, setLocale, direction }}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages[locale]}
        timeZone="Asia/Jerusalem"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
