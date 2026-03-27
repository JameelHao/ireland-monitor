import i18next from 'i18next';

// English is always needed — bundle it eagerly.
import enTranslation from '../locales/en.json';

/**
 * FR #183: Force English UI regardless of browser language.
 * Removed LanguageDetector to disable automatic language detection.
 */
const FORCED_LANGUAGE = 'en';

type TranslationDictionary = Record<string, unknown>;

/**
 * Initialize i18n with forced English language.
 * FR #183: Disable browser language auto-detection.
 */
export async function initI18n(): Promise<void> {
  // Clear any previously cached language preference
  localStorage.removeItem('i18nextLng');

  if (i18next.isInitialized) {
    document.documentElement.setAttribute('lang', FORCED_LANGUAGE);
    return;
  }

  await i18next.init({
    resources: {
      en: { translation: enTranslation as TranslationDictionary },
    },
    lng: FORCED_LANGUAGE, // Force English
    supportedLngs: ['en'], // Only support English
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
  });

  document.documentElement.setAttribute('lang', FORCED_LANGUAGE);
}

// Helper to translate
export function t(key: string, options?: Record<string, unknown>): string {
  return i18next.t(key, options);
}

// Helper to change language (no-op since we force English)
export async function changeLanguage(_lng: string): Promise<void> {
  // FR #183: Language switching is disabled, always use English
  console.warn('Language switching is disabled. UI is forced to English.');
}

// Helper to get current language (always returns 'en')
export function getCurrentLanguage(): string {
  return FORCED_LANGUAGE;
}

// RTL is disabled since we only support English
export function isRTL(): boolean {
  return false;
}

export function getLocale(): string {
  return 'en-US';
}

// Keep LANGUAGES export for backward compatibility, but only English is active
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
];
