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
      className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900
                 hover:bg-slate-100 rounded-lg transition-all duration-150
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label={`Switch to ${locale === 'en' ? 'Hebrew' : 'English'}`}
    >
      {locale === 'en' ? 'עב' : 'EN'}
    </button>
  );
}
