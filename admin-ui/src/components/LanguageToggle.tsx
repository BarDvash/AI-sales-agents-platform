'use client';

import { useLocale } from '@/i18n/client';
import { Locale } from '@/i18n/config';

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  const toggleLocale = () => {
    const newLocale: Locale = locale === 'en' ? 'he' : 'en';
    setLocale(newLocale);
  };

  return (
    <button
      onClick={toggleLocale}
      className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150
                 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        color: "var(--text-muted)",
        ["--tw-ring-color" as string]: "var(--focus-ring)",
        ["--tw-ring-offset-color" as string]: "var(--bg-primary)",
      }}
      aria-label={`Switch to ${locale === 'en' ? 'Hebrew' : 'English'}`}
    >
      {locale === 'en' ? 'עב' : 'EN'}
    </button>
  );
}
