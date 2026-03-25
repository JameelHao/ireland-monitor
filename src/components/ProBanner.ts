/**
 * Pro Banner Component
 *
 * Displays a compact promotional banner for Pro features.
 * Can be dismissed for 7 days via close button.
 */

let bannerEl: HTMLElement | null = null;

// Dismiss key and duration (7 days)
const DISMISS_KEY = 'wm-pro-banner-dismissed';
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Check if banner was dismissed within the last 7 days
 */
function isDismissed(): boolean {
  const ts = localStorage.getItem(DISMISS_KEY);
  if (!ts) return false;
  if (Date.now() - Number(ts) > DISMISS_MS) {
    localStorage.removeItem(DISMISS_KEY);
    return false;
  }
  return true;
}

/**
 * Dismiss the banner with animation and store timestamp
 */
function dismiss(): void {
  if (!bannerEl) return;
  bannerEl.classList.add('pro-banner-out');
  setTimeout(() => {
    bannerEl?.remove();
    bannerEl = null;
  }, 300);
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

/**
 * Show the Pro banner if not dismissed
 * Uses compact design (36px height) with dismiss button
 */
export function showProBanner(container: HTMLElement): void {
  if (bannerEl) return;
  if (window.self !== window.top) return;
  if (isDismissed()) return;

  const banner = document.createElement('div');
  banner.className = 'pro-banner pro-banner-compact';
  banner.innerHTML = `
    <span class="pro-banner-badge">PRO</span>
    <span class="pro-banner-text">
      <strong>PRO Coming Soon</strong>
    </span>
    <a class="pro-banner-cta" href="/pro">Reserve your spot →</a>
    <button class="pro-banner-close" aria-label="Dismiss">×</button>
  `;

  // Add close button handler
  const closeBtn = banner.querySelector('.pro-banner-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dismiss();
    });
  }

  const header = container.querySelector('.header');
  if (header) {
    header.before(banner);
  } else {
    container.prepend(banner);
  }

  bannerEl = banner;
  requestAnimationFrame(() => banner.classList.add('pro-banner-in'));
}

export function hideProBanner(): void {
  if (!bannerEl) return;
  bannerEl.classList.add('pro-banner-out');
  setTimeout(() => {
    bannerEl?.remove();
    bannerEl = null;
  }, 300);
}

export function isProBannerVisible(): boolean {
  return bannerEl !== null;
}

// Export constants for testing
export const PRO_BANNER_DISMISS_KEY = DISMISS_KEY;
export const PRO_BANNER_DISMISS_MS = DISMISS_MS;
