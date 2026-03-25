/**
 * Company Profile Component
 *
 * Full-screen overlay displaying detailed company information.
 * Accessed via /company/:id URL or View Company Profile button.
 */

import { escapeHtml, sanitizeUrl } from '@/utils/sanitize';
import { IRELAND_COMPANIES } from '@/data/ireland-companies';
import type { Company } from '@/types/company';
import { renderLogo } from '@/utils/logoFallback';

/**
 * Company Profile Manager
 *
 * Handles showing/hiding company profile overlay and URL routing.
 */
export class CompanyProfile {
  private container: HTMLElement | null = null;
  private isOpen = false;
  private popstateHandler: (() => void) | null = null;

  constructor() {
    this.checkInitialRoute();
    this.setupPopstateListener();
  }

  /**
   * Check URL on page load for /company/:id route
   */
  private checkInitialRoute(): void {
    const match = window.location.pathname.match(/^\/company\/([^/]+)$/);
    if (match && match[1]) {
      const companyId = decodeURIComponent(match[1]);
      this.show(companyId, false); // Don't push state on initial load
    }
  }

  /**
   * Listen for browser back/forward navigation
   */
  private setupPopstateListener(): void {
    this.popstateHandler = () => {
      const match = window.location.pathname.match(/^\/company\/([^/]+)$/);
      if (match && match[1]) {
        const companyId = decodeURIComponent(match[1]);
        this.show(companyId, false);
      } else {
        this.hide(false);
      }
    };
    window.addEventListener('popstate', this.popstateHandler);
  }

  /**
   * Show company profile for given ID
   */
  public show(companyId: string, pushState = true): void {
    const company = this.findCompany(companyId);

    // Create container if needed
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'company-profile-overlay';
      document.body.appendChild(this.container);
    }

    // Render content
    this.container.innerHTML = company
      ? this.renderProfile(company)
      : this.renderNotFound(companyId);

    // Show overlay
    this.container.classList.add('open');
    this.isOpen = true;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Update URL
    if (pushState) {
      window.history.pushState({ companyId }, '', `/company/${encodeURIComponent(companyId)}`);
    }

    // Setup close handlers
    this.setupCloseHandlers();
  }

  /**
   * Hide company profile
   */
  public hide(pushState = true): void {
    if (!this.container || !this.isOpen) return;

    this.container.classList.remove('open');
    this.isOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';

    // Update URL back to map
    if (pushState) {
      window.history.pushState({}, '', '/');
    }
  }

  /**
   * Find company by ID or slug
   */
  private findCompany(id: string): Company | undefined {
    const lowerId = id.toLowerCase();
    return IRELAND_COMPANIES.find(
      c => c.id.toLowerCase() === lowerId || c.slug.toLowerCase() === lowerId
    );
  }

  /**
   * Setup close button and overlay click handlers
   */
  private setupCloseHandlers(): void {
    if (!this.container) return;

    // Close button
    const closeBtn = this.container.querySelector<HTMLElement>('.profile-close');
    closeBtn?.addEventListener('click', () => this.hide());

    // Back to map button
    const backBtn = this.container.querySelector<HTMLElement>('.profile-back-btn');
    backBtn?.addEventListener('click', () => this.hide());

    // Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hide();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Click overlay background to close
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.hide();
      }
    });
  }

  /**
   * Render company profile content
   */
  private renderProfile(company: Company): string {
    const logoHtml = renderLogo(company.logo, company.name, 64);

    return `
      <div class="profile-panel">
        <button class="profile-close" aria-label="Close">×</button>

        <header class="profile-header">
          <div class="profile-logo">${logoHtml}</div>
          <div class="profile-header-content">
            <h1 class="profile-name">${escapeHtml(company.name)}</h1>
            ${company.tags?.length ? `
              <div class="profile-tags">
                ${company.tags.map(tag => `<span class="profile-tag profile-tag-${escapeHtml(tag)}">${this.formatTag(tag)}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        </header>

        <div class="profile-content">
          ${company.description ? `
            <section class="profile-section">
              <h2>About</h2>
              <p class="profile-description">${escapeHtml(company.description)}</p>
            </section>
          ` : ''}

          <section class="profile-section">
            <h2>Details</h2>
            <div class="profile-details-grid">
              ${company.industry ? `
                <div class="profile-detail">
                  <span class="detail-icon">🏢</span>
                  <div class="detail-content">
                    <span class="detail-label">Industry</span>
                    <span class="detail-value">${escapeHtml(company.industry)}</span>
                  </div>
                </div>
              ` : ''}
              ${company.founded ? `
                <div class="profile-detail">
                  <span class="detail-icon">📅</span>
                  <div class="detail-content">
                    <span class="detail-label">Founded</span>
                    <span class="detail-value">${company.founded}</span>
                  </div>
                </div>
              ` : ''}
              ${company.headquarters ? `
                <div class="profile-detail">
                  <span class="detail-icon">📍</span>
                  <div class="detail-content">
                    <span class="detail-label">Headquarters</span>
                    <span class="detail-value">${escapeHtml(company.headquarters)}</span>
                  </div>
                </div>
              ` : ''}
              ${company.employeeCount ? `
                <div class="profile-detail">
                  <span class="detail-icon">👥</span>
                  <div class="detail-content">
                    <span class="detail-label">Employees</span>
                    <span class="detail-value">${escapeHtml(company.employeeCount)}</span>
                  </div>
                </div>
              ` : ''}
              ${company.address ? `
                <div class="profile-detail">
                  <span class="detail-icon">🏠</span>
                  <div class="detail-content">
                    <span class="detail-label">Irish Office</span>
                    <span class="detail-value">${escapeHtml(company.address)}</span>
                  </div>
                </div>
              ` : ''}
            </div>
          </section>

          ${company.funding ? this.renderFundingSection(company.funding) : ''}

          ${company.people?.length ? this.renderPeopleSection(company.people) : ''}

          <section class="profile-section profile-links">
            <h2>Links</h2>
            <div class="profile-link-grid">
              ${company.website ? `
                <a class="profile-link" href="${sanitizeUrl(company.website)}" target="_blank" rel="noopener">
                  <span class="link-icon">🌐</span>
                  <span>Website</span>
                </a>
              ` : ''}
              ${company.linkedin ? `
                <a class="profile-link" href="${sanitizeUrl(company.linkedin)}" target="_blank" rel="noopener">
                  <span class="link-icon">💼</span>
                  <span>LinkedIn</span>
                </a>
              ` : ''}
              ${company.twitter ? `
                <a class="profile-link" href="https://twitter.com/${escapeHtml(company.twitter)}" target="_blank" rel="noopener">
                  <span class="link-icon">𝕏</span>
                  <span>Twitter</span>
                </a>
              ` : ''}
            </div>
          </section>
        </div>

        <footer class="profile-footer">
          <button class="profile-back-btn">
            ← Back to Map
          </button>
          ${company.updatedAt ? `
            <span class="profile-updated">Last updated: ${escapeHtml(company.updatedAt)}</span>
          ` : ''}
        </footer>
      </div>
    `;
  }

  /**
   * Render funding section
   */
  private renderFundingSection(funding: Company['funding']): string {
    if (!funding) return '';
    return `
      <section class="profile-section">
        <h2>Funding</h2>
        <div class="profile-details-grid">
          <div class="profile-detail">
            <span class="detail-icon">💰</span>
            <div class="detail-content">
              <span class="detail-label">Total Raised</span>
              <span class="detail-value">${escapeHtml(funding.total)}</span>
            </div>
          </div>
          ${funding.lastRound ? `
            <div class="profile-detail">
              <span class="detail-icon">📊</span>
              <div class="detail-content">
                <span class="detail-label">Last Round</span>
                <span class="detail-value">${escapeHtml(funding.lastRound)}${funding.lastRoundDate ? ` (${escapeHtml(funding.lastRoundDate)})` : ''}</span>
              </div>
            </div>
          ` : ''}
          ${funding.investors?.length ? `
            <div class="profile-detail profile-detail-wide">
              <span class="detail-icon">🏛️</span>
              <div class="detail-content">
                <span class="detail-label">Notable Investors</span>
                <span class="detail-value">${funding.investors.map(i => escapeHtml(i)).join(', ')}</span>
              </div>
            </div>
          ` : ''}
        </div>
      </section>
    `;
  }

  /**
   * Render people/leadership section
   */
  private renderPeopleSection(people: Company['people']): string {
    if (!people?.length) return '';
    return `
      <section class="profile-section">
        <h2>Leadership</h2>
        <div class="profile-people-grid">
          ${people.slice(0, 4).map(person => `
            <div class="profile-person">
              <div class="person-avatar">${this.getInitials(person.name)}</div>
              <div class="person-info">
                <span class="person-name">${escapeHtml(person.name)}</span>
                <span class="person-title">${escapeHtml(person.title)}</span>
              </div>
              ${person.linkedin ? `
                <a class="person-linkedin" href="${sanitizeUrl(person.linkedin)}" target="_blank" rel="noopener" title="LinkedIn">
                  💼
                </a>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  /**
   * Render not found page
   */
  private renderNotFound(companyId: string): string {
    return `
      <div class="profile-panel profile-not-found">
        <button class="profile-close" aria-label="Close">×</button>

        <div class="not-found-content">
          <div class="not-found-icon">🔍</div>
          <h1>Company Not Found</h1>
          <p>We couldn't find a company with ID "${escapeHtml(companyId)}".</p>
          <button class="profile-back-btn">
            ← Back to Map
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Format tag for display
   */
  private formatTag(tag: string): string {
    const tagLabels: Record<string, string> = {
      'unicorn': '🦄 Unicorn',
      'tech-hq': '🏢 Tech HQ',
      'data-center': '🖥️ Data Center',
      'semiconductor': '💎 Semiconductor',
      'startup': '🚀 Startup',
      'multinational': '🌍 Multinational',
      'irish-founded': '☘️ Irish Founded',
    };
    return tagLabels[tag] || tag;
  }

  /**
   * Get initials from name
   */
  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Clean up event listeners
   */
  public destroy(): void {
    if (this.popstateHandler) {
      window.removeEventListener('popstate', this.popstateHandler);
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

// Singleton instance
let companyProfileInstance: CompanyProfile | null = null;

/**
 * Get or create the CompanyProfile singleton
 */
export function getCompanyProfile(): CompanyProfile {
  if (!companyProfileInstance) {
    companyProfileInstance = new CompanyProfile();
  }
  return companyProfileInstance;
}

/**
 * Show company profile for given ID
 */
export function showCompanyProfile(companyId: string): void {
  getCompanyProfile().show(companyId);
}

/**
 * Hide company profile
 */
export function hideCompanyProfile(): void {
  getCompanyProfile().hide();
}
