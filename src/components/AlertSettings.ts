import { ALERT_PRESETS } from '@/config/alert-presets';
import { alertStorage } from '@/services/alert-storage';
import { escapeHtml } from '@/utils/sanitize';

export class AlertSettings {
  private readonly container: HTMLElement;
  private readonly onUpdated: () => void;

  constructor(container: HTMLElement, onUpdated: () => void) {
    this.container = container;
    this.onUpdated = onUpdated;
  }

  public mount(): void {
    this.render();
    this.bindEvents();
  }

  public render(): void {
    const keywords = alertStorage.getKeywords();
    this.container.innerHTML = `
      <div class="alert-settings">
        <div class="alert-settings-title">Manage Keywords</div>
        <div class="alert-settings-input-row">
          <input id="alertKeywordInput" class="alert-settings-input" placeholder="Add keyword..." />
          <button id="alertKeywordAddBtn" class="alert-settings-add">Add</button>
        </div>
        <div class="alert-presets">
          ${ALERT_PRESETS.map((preset) => `<button class="alert-preset-btn" data-keyword="${escapeHtml(preset.keyword)}">${escapeHtml(preset.label)}</button>`).join('')}
        </div>
        <div class="alert-keyword-list">
          ${keywords.map((item) => `
            <div class="alert-keyword-item">
              <label>
                <input type="checkbox" data-toggle-id="${item.id}" ${item.enabled ? 'checked' : ''} />
                ${escapeHtml(item.keyword)}
              </label>
              <button data-delete-id="${item.id}" class="alert-keyword-delete">×</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    this.container.querySelector('#alertKeywordAddBtn')?.addEventListener('click', () => this.addFromInput());
    this.container.querySelector('#alertKeywordInput')?.addEventListener('keydown', (event) => {
      if ((event as KeyboardEvent).key === 'Enter') this.addFromInput();
    });

    this.container.querySelectorAll<HTMLElement>('.alert-preset-btn').forEach((el) => {
      el.addEventListener('click', () => {
        const keyword = el.dataset.keyword;
        if (!keyword) return;
        this.tryAddKeyword(keyword);
      });
    });

    this.container.querySelectorAll<HTMLInputElement>('input[data-toggle-id]').forEach((el) => {
      el.addEventListener('change', () => {
        const id = el.dataset.toggleId;
        if (!id) return;
        alertStorage.toggleKeyword(id);
        this.render();
        this.bindEvents();
        this.onUpdated();
      });
    });

    this.container.querySelectorAll<HTMLElement>('button[data-delete-id]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.dataset.deleteId;
        if (!id) return;
        alertStorage.removeKeyword(id);
        this.render();
        this.bindEvents();
        this.onUpdated();
      });
    });
  }

  private addFromInput(): void {
    const input = this.container.querySelector<HTMLInputElement>('#alertKeywordInput');
    const value = input?.value || '';
    this.tryAddKeyword(value);
    if (input) input.value = '';
  }

  private tryAddKeyword(keyword: string): void {
    try {
      alertStorage.addKeyword(keyword);
      this.render();
      this.bindEvents();
      this.onUpdated();
    } catch {
      // 错误通过静默失败避免打断主流程。
    }
  }
}
