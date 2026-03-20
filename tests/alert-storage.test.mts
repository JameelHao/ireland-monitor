import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ALERT_KEYWORD_LIMIT } from '@/types/alert';
import { AlertStorage } from '@/services/alert-storage';

class MemoryStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }
}

describe('alert-storage', () => {
  let storage: MemoryStorage;
  let service: AlertStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    (globalThis as any).window = { localStorage: storage };
    service = new AlertStorage();
  });

  it('add/get/remove keyword works', () => {
    const first = service.addKeyword('Enterprise Ireland');
    const second = service.addKeyword('TCD');
    assert.equal(service.getKeywords().length, 2);

    service.removeKeyword(first.id);
    const keywords = service.getKeywords();
    assert.equal(keywords.length, 1);
    assert.equal(keywords[0]?.id, second.id);
  });

  it('toggle keyword enabled state', () => {
    const item = service.addKeyword('funding');
    const toggled = service.toggleKeyword(item.id);
    assert.equal(toggled?.enabled, false);
    assert.equal(service.getKeywords()[0]?.enabled, false);
  });

  it('prevents duplicate keyword ignoring case', () => {
    service.addKeyword('Dublin Tech Summit');
    assert.throws(() => service.addKeyword('dublin tech summit'), /已存在/);
  });

  it('enforces max keyword limit', () => {
    for (let i = 0; i < ALERT_KEYWORD_LIMIT; i += 1) {
      service.addKeyword(`kw-${i}`);
    }
    assert.throws(() => service.addKeyword('overflow'), /最多/);
  });

  it('recovers from invalid localStorage payload', () => {
    storage.setItem('irishtech-alerts', '{invalid json');
    const pref = service.getPreferences();
    assert.equal(pref.keywords.length, 0);
    assert.equal(pref.notifySound, true);
    assert.equal(pref.notifyBrowser, true);
  });

  it('persists notify preferences', () => {
    service.setNotificationPreferences({ notifySound: false, notifyBrowser: true });
    const pref = service.getPreferences();
    assert.equal(pref.notifySound, false);
    assert.equal(pref.notifyBrowser, true);
  });
});
