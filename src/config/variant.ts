// Valid variants including Ireland
type Variant = 'full' | 'tech' | 'finance' | 'happy' | 'commodity' | 'ireland';

const isValidVariant = (v: string): v is Variant =>
  ['full', 'tech', 'finance', 'happy', 'commodity', 'ireland'].includes(v);

const buildVariant = (() => {
  try {
    const v = import.meta.env?.VITE_VARIANT || 'full';
    return isValidVariant(v) ? v : 'full';
  } catch {
    return 'full';
  }
})();

export const SITE_VARIANT: string = (() => {
  if (typeof window === 'undefined') return buildVariant;

  const isTauri = '__TAURI_INTERNALS__' in window || '__TAURI__' in window;
  if (isTauri) {
    const stored = localStorage.getItem('worldmonitor-variant');
    if (stored && isValidVariant(stored)) return stored;
    return buildVariant;
  }

  const h = location.hostname;
  if (h.startsWith('tech.')) return 'tech';
  if (h.startsWith('finance.')) return 'finance';
  if (h.startsWith('happy.')) return 'happy';
  if (h.startsWith('commodity.')) return 'commodity';
  if (h.startsWith('ireland.') || h.includes('ireland-monitor')) return 'ireland';

  if (h === 'localhost' || h === '127.0.0.1') {
    const stored = localStorage.getItem('worldmonitor-variant');
    if (stored && isValidVariant(stored)) return stored;
    return buildVariant;
  }

  return 'full';
})();
