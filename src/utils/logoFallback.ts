/**
 * Logo Fallback Utility
 *
 * Generate fallback display when company logo is unavailable.
 * Creates initials-based placeholder with consistent styling.
 */

/**
 * Generate initials from company name
 * @param name - Company or entity name
 * @returns 1-2 character initials
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) {
    return (words[0] ?? '').slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map(w => (w ?? '')[0] ?? '')
    .join('')
    .toUpperCase();
}

/**
 * Hash a string to get consistent color
 * @param str - String to hash
 * @returns Hue value (0-360)
 */
function hashToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 360;
}

/**
 * Generate background color based on company name
 * @param name - Company name
 * @returns HSL color string
 */
export function getInitialsBackground(name: string): string {
  const hue = hashToHue(name);
  return `hsl(${hue}, 45%, 35%)`;
}

/**
 * Render an initials placeholder as HTML
 * @param name - Company name
 * @param size - Size in pixels (default: 48)
 * @returns HTML string for initials placeholder
 */
export function renderInitialsPlaceholder(name: string, size = 48): string {
  const initials = getInitials(name);
  const bgColor = getInitialsBackground(name);
  const fontSize = Math.round(size * 0.4);

  return `
    <div class="logo-initials" style="
      width: ${size}px;
      height: ${size}px;
      background: ${bgColor};
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: ${fontSize}px;
      font-weight: 600;
      flex-shrink: 0;
    ">${initials}</div>
  `;
}

/**
 * Create a logo element with fallback
 * @param logoUrl - URL of logo image (optional)
 * @param name - Company name for fallback
 * @param size - Size in pixels
 * @returns HTML string for logo or fallback
 */
export function renderLogo(logoUrl: string | undefined, name: string, size = 48): string {
  if (logoUrl) {
    // Use onerror to fall back to initials if image fails to load
    const initials = getInitials(name);
    const bgColor = getInitialsBackground(name);
    const fontSize = Math.round(size * 0.4);

    return `
      <img
        src="${logoUrl}"
        alt="${name}"
        class="company-logo"
        style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 8px;
          object-fit: contain;
          flex-shrink: 0;
        "
        onerror="this.outerHTML='<div class=\\'logo-initials\\' style=\\'width: ${size}px; height: ${size}px; background: ${bgColor}; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: ${fontSize}px; font-weight: 600; flex-shrink: 0;\\'>${initials}</div>'"
      />
    `;
  }

  return renderInitialsPlaceholder(name, size);
}
