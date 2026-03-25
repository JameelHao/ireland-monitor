/**
 * ShareButton Component
 *
 * Reusable social sharing button with dropdown menu.
 * Supports Twitter/X, LinkedIn, and copy-to-clipboard.
 */

import { escapeHtml } from '@/utils/sanitize';
import { trackEvent } from '@/services/analytics';

/**
 * Share data configuration
 */
export interface ShareData {
  /** URL to share */
  url: string;
  /** Title/headline */
  title: string;
  /** Optional description */
  description?: string;
  /** Type for analytics tracking */
  type: 'news' | 'map' | 'brief';
}

/**
 * Share button options
 */
export interface ShareButtonOptions {
  /** Button size: 'small' | 'normal' */
  size?: 'small' | 'normal';
  /** Position for dropdown: 'top' | 'bottom' */
  position?: 'top' | 'bottom';
}

/** Active share menu (for closing on outside click) */
let activeMenu: HTMLElement | null = null;

// Close menu when clicking outside (only in browser)
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (activeMenu && !activeMenu.contains(e.target as Node)) {
      activeMenu.classList.remove('open');
      activeMenu = null;
    }
  });
}

/**
 * Build URL with UTM parameters for tracking
 */
export function buildShareUrl(
  baseUrl: string,
  source: 'twitter' | 'linkedin' | 'copy'
): string {
  try {
    // Use a fallback base for relative URLs in non-browser environments
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://ireland-monitor.app';
    const url = new URL(baseUrl, base);
    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', 'social');
    url.searchParams.set('utm_campaign', 'share');
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Share to Twitter/X
 */
export function shareToTwitter(data: ShareData): void {
  const url = buildShareUrl(data.url, 'twitter');
  const text = `${data.title}`;
  const hashtags = 'IrishTech';

  const intentUrl = new URL('https://twitter.com/intent/tweet');
  intentUrl.searchParams.set('text', text);
  intentUrl.searchParams.set('url', url);
  intentUrl.searchParams.set('hashtags', hashtags);

  window.open(intentUrl.toString(), '_blank', 'width=550,height=420');

  trackEvent('share', {
    type: data.type,
    platform: 'twitter',
    title: data.title,
  });
}

/**
 * Share to LinkedIn
 */
export function shareToLinkedIn(data: ShareData): void {
  const url = buildShareUrl(data.url, 'linkedin');

  const shareUrl = new URL('https://www.linkedin.com/sharing/share-offsite/');
  shareUrl.searchParams.set('url', url);

  window.open(shareUrl.toString(), '_blank', 'width=550,height=420');

  trackEvent('share', {
    type: data.type,
    platform: 'linkedin',
    title: data.title,
  });
}

/**
 * Copy link to clipboard
 */
export async function copyShareLink(data: ShareData): Promise<boolean> {
  const url = buildShareUrl(data.url, 'copy');

  try {
    await navigator.clipboard.writeText(url);
    trackEvent('share', {
      type: data.type,
      platform: 'copy',
      title: data.title,
    });
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      trackEvent('share', {
        type: data.type,
        platform: 'copy',
        title: data.title,
      });
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Show toast notification
 */
function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  // Check for existing toast container
  let container = document.getElementById('share-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'share-toast-container';
    container.className = 'share-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `share-toast share-toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after delay
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}

/**
 * Create share button HTML
 */
export function createShareButton(
  data: ShareData,
  options: ShareButtonOptions = {}
): string {
  const { size = 'small', position = 'top' } = options;

  const buttonId = `share-btn-${Math.random().toString(36).slice(2, 9)}`;

  return `
    <div class="share-button share-button-${size}" id="${buttonId}" data-share='${escapeHtml(JSON.stringify(data))}'>
      <button class="share-trigger" title="Share" aria-label="Share this content">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>
      <div class="share-menu share-menu-${position}">
        <button class="share-option" data-action="twitter">
          <span class="share-icon">𝕏</span>
          <span>Twitter</span>
        </button>
        <button class="share-option" data-action="linkedin">
          <span class="share-icon">in</span>
          <span>LinkedIn</span>
        </button>
        <div class="share-divider"></div>
        <button class="share-option" data-action="copy">
          <span class="share-icon">📋</span>
          <span>Copy link</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Initialize share button event handlers
 * Call this after adding share buttons to the DOM
 */
export function initShareButton(container: HTMLElement): void {
  container.querySelectorAll<HTMLElement>('.share-button').forEach((btn) => {
    // Skip if already initialized
    if (btn.dataset.initialized === 'true') return;
    btn.dataset.initialized = 'true';

    const trigger = btn.querySelector<HTMLElement>('.share-trigger');
    const menu = btn.querySelector<HTMLElement>('.share-menu');
    if (!trigger || !menu) return;

    // Parse share data
    const dataStr = btn.dataset.share;
    if (!dataStr) return;

    let data: ShareData;
    try {
      data = JSON.parse(dataStr);
    } catch {
      return;
    }

    // Toggle menu
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Close other menus
      if (activeMenu && activeMenu !== menu) {
        activeMenu.classList.remove('open');
      }

      menu.classList.toggle('open');
      activeMenu = menu.classList.contains('open') ? menu : null;
    });

    // Handle menu actions
    menu.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const option = target.closest<HTMLElement>('.share-option');
      if (!option) return;

      e.stopPropagation();
      e.preventDefault();

      const action = option.dataset.action;

      switch (action) {
        case 'twitter':
          shareToTwitter(data);
          break;
        case 'linkedin':
          shareToLinkedIn(data);
          break;
        case 'copy': {
          const success = await copyShareLink(data);
          showToast(
            success ? 'Link copied to clipboard!' : 'Failed to copy link',
            success ? 'success' : 'error'
          );
          break;
        }
      }

      // Close menu after action
      menu.classList.remove('open');
      activeMenu = null;
    });
  });
}

/**
 * Create and mount a share button for the map toolbar
 */
export function createMapShareButton(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'map-share-wrapper';

  const data: ShareData = {
    url: window.location.href,
    title: 'Ireland Tech Map - Explore tech companies, data centers, and more',
    type: 'map',
  };

  container.innerHTML = createShareButton(data, { size: 'normal', position: 'bottom' });

  // Initialize events
  setTimeout(() => initShareButton(container), 0);

  return container;
}
