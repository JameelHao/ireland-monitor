/**
 * CTA Buttons Tests
 *
 * Tests for Brief and Alert button status logic.
 */

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

// Set up global localStorage mock
(globalThis as unknown as { localStorage: typeof localStorageMock }).localStorage = localStorageMock;

// Import after setting up mock
import {
  hasNewBrief,
  getLastReadAt,
  setLastReadAt,
  markBriefAsRead,
  getBriefStatus,
} from '../src/hooks/useBriefStatus';

import {
  getUnreadCount,
  setUnreadCount,
  markAllAlertsAsRead,
  incrementUnreadCount,
  getAlertStatus,
} from '../src/hooks/useAlertStatus';

// ==============================================================
// Brief Status Tests
// ==============================================================

describe('Brief Status', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getLastReadAt', () => {
    it('should return 0 when not set', () => {
      assert.equal(getLastReadAt(), 0);
    });

    it('should return stored timestamp', () => {
      const timestamp = Date.now();
      localStorageMock.setItem('worldmonitor_lastBriefReadAt', timestamp.toString());
      assert.equal(getLastReadAt(), timestamp);
    });

    it('should return 0 for invalid stored value', () => {
      localStorageMock.setItem('worldmonitor_lastBriefReadAt', 'invalid');
      assert.equal(getLastReadAt(), 0);
    });
  });

  describe('setLastReadAt', () => {
    it('should store timestamp', () => {
      const timestamp = 1234567890;
      setLastReadAt(timestamp);
      assert.equal(localStorageMock.getItem('worldmonitor_lastBriefReadAt'), '1234567890');
    });

    it('should use current time as default', () => {
      const before = Date.now();
      setLastReadAt();
      const after = Date.now();
      const stored = parseInt(localStorageMock.getItem('worldmonitor_lastBriefReadAt') ?? '0', 10);
      assert.ok(stored >= before && stored <= after);
    });
  });

  describe('hasNewBrief', () => {
    it('should return true when never read', () => {
      // Never read, so any brief is new
      assert.equal(hasNewBrief(), true);
    });

    it('should return false when read today', () => {
      // Mark as read now
      setLastReadAt(Date.now());
      assert.equal(hasNewBrief(), false);
    });
  });

  describe('markBriefAsRead', () => {
    it('should update lastReadAt', () => {
      const before = Date.now();
      markBriefAsRead();
      const after = Date.now();
      const stored = getLastReadAt();
      assert.ok(stored >= before && stored <= after);
    });
  });

  describe('getBriefStatus', () => {
    it('should return status object', () => {
      const status = getBriefStatus();
      assert.ok('hasNewBrief' in status);
      assert.ok('lastReadAt' in status);
      assert.ok('markAsRead' in status);
      assert.equal(typeof status.markAsRead, 'function');
    });

    it('markAsRead function should work', () => {
      const status = getBriefStatus();
      status.markAsRead();
      assert.ok(getLastReadAt() > 0);
    });
  });
});

// ==============================================================
// Alert Status Tests
// ==============================================================

describe('Alert Status', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getUnreadCount', () => {
    it('should return 0 when not set', () => {
      assert.equal(getUnreadCount(), 0);
    });

    it('should return stored count', () => {
      localStorageMock.setItem('worldmonitor_unreadAlerts', '5');
      assert.equal(getUnreadCount(), 5);
    });

    it('should return 0 for invalid stored value', () => {
      localStorageMock.setItem('worldmonitor_unreadAlerts', 'invalid');
      assert.equal(getUnreadCount(), 0);
    });
  });

  describe('setUnreadCount', () => {
    it('should store count', () => {
      setUnreadCount(10);
      assert.equal(localStorageMock.getItem('worldmonitor_unreadAlerts'), '10');
    });

    it('should not allow negative counts', () => {
      setUnreadCount(-5);
      assert.equal(localStorageMock.getItem('worldmonitor_unreadAlerts'), '0');
    });
  });

  describe('markAllAlertsAsRead', () => {
    it('should reset count to 0', () => {
      setUnreadCount(10);
      markAllAlertsAsRead();
      assert.equal(getUnreadCount(), 0);
    });
  });

  describe('incrementUnreadCount', () => {
    it('should increment from 0', () => {
      incrementUnreadCount();
      assert.equal(getUnreadCount(), 1);
    });

    it('should increment from existing count', () => {
      setUnreadCount(5);
      incrementUnreadCount();
      assert.equal(getUnreadCount(), 6);
    });
  });

  describe('getAlertStatus', () => {
    it('should return status object', () => {
      const status = getAlertStatus();
      assert.ok('isSetup' in status);
      assert.ok('alertCount' in status);
      assert.ok('unreadCount' in status);
      assert.ok('markAllAsRead' in status);
      assert.ok('incrementUnread' in status);
    });

    it('should return isSetup false when no monitors', () => {
      const status = getAlertStatus();
      assert.equal(status.isSetup, false);
      assert.equal(status.alertCount, 0);
    });

    it('markAllAsRead function should work', () => {
      setUnreadCount(5);
      const status = getAlertStatus();
      status.markAllAsRead();
      assert.equal(getUnreadCount(), 0);
    });

    it('incrementUnread function should work', () => {
      const status = getAlertStatus();
      status.incrementUnread();
      assert.equal(getUnreadCount(), 1);
    });
  });
});

// ==============================================================
// Edge Cases
// ==============================================================

describe('Edge Cases', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should handle multiple increments', () => {
    incrementUnreadCount();
    incrementUnreadCount();
    incrementUnreadCount();
    assert.equal(getUnreadCount(), 3);
  });

  it('should handle read-increment-read cycle', () => {
    incrementUnreadCount();
    assert.equal(getUnreadCount(), 1);
    markAllAlertsAsRead();
    assert.equal(getUnreadCount(), 0);
    incrementUnreadCount();
    incrementUnreadCount();
    assert.equal(getUnreadCount(), 2);
  });

  it('brief status should be consistent', () => {
    assert.equal(hasNewBrief(), true);
    markBriefAsRead();
    assert.equal(hasNewBrief(), false);
  });
});

// ==============================================================
// Integration Tests
// ==============================================================

describe('Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('brief and alert status should be independent', () => {
    // Brief operations shouldn't affect alerts
    markBriefAsRead();
    assert.equal(getUnreadCount(), 0);

    // Alert operations shouldn't affect brief
    incrementUnreadCount();
    assert.ok(getLastReadAt() > 0);
    assert.equal(getUnreadCount(), 1);
  });
});
