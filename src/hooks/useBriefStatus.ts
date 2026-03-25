/**
 * Brief Status Hook
 *
 * Tracks whether user has new unread daily brief content.
 * Uses localStorage to persist read state.
 */

const STORAGE_KEY = 'worldmonitor_lastBriefReadAt';

/**
 * Brief status result
 */
export interface BriefStatus {
  /** Whether there's a new brief the user hasn't read */
  hasNewBrief: boolean;
  /** Timestamp when user last read the brief */
  lastReadAt: number;
  /** Mark the current brief as read */
  markAsRead: () => void;
}

/**
 * Get the last brief generation timestamp
 * In a real implementation, this would come from the API
 * For now, we use a simple daily rotation (midnight UTC)
 */
function getLastBriefTimestamp(): number {
  const now = new Date();
  // Brief is considered "new" if generated today
  const todayMidnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
  return todayMidnight.getTime();
}

/**
 * Get the timestamp when user last read the brief
 */
export function getLastReadAt(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch {
    // localStorage not available
  }
  return 0;
}

/**
 * Set the timestamp when user last read the brief
 */
export function setLastReadAt(timestamp = Date.now()): void {
  try {
    localStorage.setItem(STORAGE_KEY, timestamp.toString());
  } catch {
    // localStorage not available
  }
}

/**
 * Check if there's a new brief the user hasn't read
 */
export function hasNewBrief(): boolean {
  const lastBriefTimestamp = getLastBriefTimestamp();
  const lastReadAt = getLastReadAt();
  return lastBriefTimestamp > lastReadAt;
}

/**
 * Mark the current brief as read
 */
export function markBriefAsRead(): void {
  setLastReadAt(Date.now());
}

/**
 * Get brief status (for non-React usage)
 */
export function getBriefStatus(): BriefStatus {
  return {
    hasNewBrief: hasNewBrief(),
    lastReadAt: getLastReadAt(),
    markAsRead: markBriefAsRead,
  };
}

/**
 * Initialize brief button with status updates
 * Call this after the button is rendered
 */
export function initBriefButtonStatus(button: HTMLElement | null): void {
  if (!button) return;

  const updateStatus = () => {
    const status = getBriefStatus();
    if (status.hasNewBrief) {
      button.classList.add('has-new-brief');
      // Add indicator if not exists
      if (!button.querySelector('.new-indicator')) {
        const indicator = document.createElement('span');
        indicator.className = 'new-indicator';
        indicator.setAttribute('aria-label', 'New brief available');
        button.appendChild(indicator);
      }
    } else {
      button.classList.remove('has-new-brief');
      const indicator = button.querySelector('.new-indicator');
      if (indicator) indicator.remove();
    }
  };

  // Initial update
  updateStatus();

  // Listen for click to mark as read
  button.addEventListener('click', () => {
    markBriefAsRead();
    button.classList.remove('has-new-brief');
    const indicator = button.querySelector('.new-indicator');
    if (indicator) indicator.remove();
  });
}
