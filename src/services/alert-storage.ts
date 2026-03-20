import { ALERT_KEYWORD_LIMIT, DEFAULT_ALERT_PREFERENCE, type AlertKeyword, type AlertPreference } from '@/types/alert';

const STORAGE_KEY = 'irishtech-alerts';

function normalizeKeyword(keyword: string): string {
  return keyword.trim().replace(/\s+/g, ' ');
}

function toKeywordKey(keyword: string): string {
  return normalizeKeyword(keyword).toLowerCase();
}

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `kw-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parsePreference(raw: string | null): AlertPreference {
  if (!raw) return { ...DEFAULT_ALERT_PREFERENCE, keywords: [] };
  try {
    const parsed = JSON.parse(raw) as Partial<AlertPreference>;
    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords
        .map((item) => {
          const keyword = typeof item?.keyword === 'string' ? normalizeKeyword(item.keyword) : '';
          if (!keyword) return null;
          return {
            id: typeof item.id === 'string' && item.id ? item.id : safeRandomId(),
            keyword,
            createdAt: typeof item.createdAt === 'string' && item.createdAt ? item.createdAt : new Date().toISOString(),
            enabled: item.enabled !== false,
          } as AlertKeyword;
        })
        .filter((item): item is AlertKeyword => !!item)
      : [];

    return {
      keywords,
      notifySound: parsed.notifySound !== false,
      notifyBrowser: parsed.notifyBrowser !== false,
    };
  } catch {
    return { ...DEFAULT_ALERT_PREFERENCE, keywords: [] };
  }
}

export class AlertStorage {
  public getPreferences(): AlertPreference {
    if (!canUseLocalStorage()) {
      return { ...DEFAULT_ALERT_PREFERENCE, keywords: [] };
    }
    return parsePreference(window.localStorage.getItem(STORAGE_KEY));
  }

  public getKeywords(): AlertKeyword[] {
    return this.getPreferences().keywords;
  }

  public addKeyword(keyword: string): AlertKeyword {
    const normalized = normalizeKeyword(keyword);
    if (!normalized) {
      throw new Error('关键词不能为空');
    }

    const current = this.getPreferences();
    if (current.keywords.length >= ALERT_KEYWORD_LIMIT) {
      throw new Error(`关键词最多 ${ALERT_KEYWORD_LIMIT} 个`);
    }

    const key = toKeywordKey(normalized);
    const exists = current.keywords.some((item) => toKeywordKey(item.keyword) === key);
    if (exists) {
      throw new Error('关键词已存在');
    }

    const newKeyword: AlertKeyword = {
      id: safeRandomId(),
      keyword: normalized,
      createdAt: new Date().toISOString(),
      enabled: true,
    };

    this.save({ ...current, keywords: [...current.keywords, newKeyword] });
    return newKeyword;
  }

  public removeKeyword(id: string): void {
    const current = this.getPreferences();
    const keywords = current.keywords.filter((item) => item.id !== id);
    this.save({ ...current, keywords });
  }

  public toggleKeyword(id: string): AlertKeyword | null {
    const current = this.getPreferences();
    let updated: AlertKeyword | null = null;

    const keywords = current.keywords.map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, enabled: !item.enabled };
      return updated;
    });

    if (!updated) return null;
    this.save({ ...current, keywords });
    return updated;
  }

  public setNotificationPreferences(partial: Pick<AlertPreference, 'notifySound' | 'notifyBrowser'>): void {
    const current = this.getPreferences();
    this.save({
      ...current,
      notifySound: partial.notifySound,
      notifyBrowser: partial.notifyBrowser,
    });
  }

  private save(preference: AlertPreference): void {
    if (!canUseLocalStorage()) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
  }
}

export const alertStorage = new AlertStorage();
