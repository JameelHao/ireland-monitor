/**
 * Alert Status Hook
 *
 * Tracks alert setup status and unread notifications.
 * Uses existing monitor system for alert count.
 */

const UNREAD_KEY = 'worldmonitor_unreadAlerts';
const MONITORS_KEY = 'worldmonitor-monitors';

/**
 * Alert status result
 */
export interface AlertStatus {
  /** Whether user has set up any alerts/monitors */
  isSetup: boolean;
  /** Number of active alerts/monitors */
  alertCount: number;
  /** Number of unread alert notifications */
  unreadCount: number;
  /** Mark all alerts as read */
  markAllAsRead: () => void;
  /** Increment unread count */
  incrementUnread: () => void;
}

/**
 * Get the current monitors (alerts) from storage
 */
function getMonitors(): unknown[] {
  try {
    const stored = localStorage.getItem(MONITORS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // localStorage not available or invalid JSON
  }
  return [];
}

/**
 * Get unread alert count from storage
 */
export function getUnreadCount(): number {
  try {
    const stored = localStorage.getItem(UNREAD_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
  } catch {
    // localStorage not available
  }
  return 0;
}

/**
 * Set unread alert count
 */
export function setUnreadCount(count: number): void {
  try {
    localStorage.setItem(UNREAD_KEY, Math.max(0, count).toString());
  } catch {
    // localStorage not available
  }
}

/**
 * Mark all alerts as read
 */
export function markAllAlertsAsRead(): void {
  setUnreadCount(0);
}

/**
 * Increment unread count
 */
export function incrementUnreadCount(): void {
  setUnreadCount(getUnreadCount() + 1);
}

/**
 * Get alert status (for non-React usage)
 */
export function getAlertStatus(): AlertStatus {
  const monitors = getMonitors();
  return {
    isSetup: monitors.length > 0,
    alertCount: monitors.length,
    unreadCount: getUnreadCount(),
    markAllAsRead: markAllAlertsAsRead,
    incrementUnread: incrementUnreadCount,
  };
}

/**
 * Initialize alert button with status updates
 * Call this after the button is rendered
 */
export function initAlertButtonStatus(
  button: HTMLElement | null,
  badge: HTMLElement | null
): void {
  if (!button) return;

  const updateStatus = () => {
    const status = getAlertStatus();

    // Handle needs-setup state
    if (!status.isSetup) {
      button.classList.add('needs-setup');
      button.setAttribute('data-tooltip', 'Set up alerts to stay updated');
      // Add setup hint if not exists
      if (!button.querySelector('.setup-hint')) {
        const hint = document.createElement('span');
        hint.className = 'setup-hint';
        hint.textContent = '→';
        button.appendChild(hint);
      }
    } else {
      button.classList.remove('needs-setup');
      button.removeAttribute('data-tooltip');
      const hint = button.querySelector('.setup-hint');
      if (hint) hint.remove();
    }

    // Handle unread state
    if (status.unreadCount > 0) {
      button.classList.add('has-unread');
      // Update or create unread badge
      let unreadBadge = button.querySelector('.unread-badge') as HTMLElement | null;
      if (!unreadBadge) {
        unreadBadge = document.createElement('span');
        unreadBadge.className = 'unread-badge';
        button.appendChild(unreadBadge);
      }
      unreadBadge.textContent = status.unreadCount > 99 ? '99+' : status.unreadCount.toString();
    } else {
      button.classList.remove('has-unread');
      const unreadBadge = button.querySelector('.unread-badge');
      if (unreadBadge) unreadBadge.remove();
    }

    // Update existing badge (alert count)
    if (badge) {
      if (status.alertCount > 0) {
        badge.textContent = status.alertCount.toString();
        badge.classList.add('visible');
      } else {
        badge.textContent = '';
        badge.classList.remove('visible');
      }
    }
  };

  // Initial update
  updateStatus();

  // Listen for click to mark as read
  button.addEventListener('click', () => {
    markAllAlertsAsRead();
    button.classList.remove('has-unread');
    const unreadBadge = button.querySelector('.unread-badge');
    if (unreadBadge) unreadBadge.remove();
  });

  // Expose update function for external triggers
  (button as HTMLElement & { updateAlertStatus?: () => void }).updateAlertStatus = updateStatus;
}

/**
 * Notify about a new alert (call this when an alert fires)
 */
export function notifyNewAlert(): void {
  incrementUnreadCount();
  // Trigger shake animation on button
  const button = document.getElementById('alertTriggerBtn');
  if (button) {
    button.classList.remove('has-unread');
    // Force reflow to restart animation
    void button.offsetWidth;
    button.classList.add('has-unread');
    // Update badge
    const updateFn = (button as HTMLElement & { updateAlertStatus?: () => void }).updateAlertStatus;
    if (updateFn) updateFn();
  }
}
