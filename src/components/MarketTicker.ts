import type { CryptoData, MarketData } from '@/types';

export interface TickerItem {
  symbol: string;
  price: number;
  change24h: number;
}

export interface MarketTickerEventDetail {
  markets?: MarketData[];
  crypto?: CryptoData[];
}

export interface MarketTickerOptions {
  symbols?: string[];
}

const DEFAULT_SYMBOLS = ['BTC', 'ETH', 'NDX'];

export function toTickerItems(detail: MarketTickerEventDetail | undefined, symbols: string[]): TickerItem[] {
  if (!detail) return [];
  const map = new Map<string, TickerItem>();

  for (const stock of detail.markets ?? []) {
    if (stock.price === null || stock.change === null) continue;
    const key = stock.display || stock.symbol;
    map.set(key, {
      symbol: key,
      price: stock.price,
      change24h: stock.change,
    });
  }

  for (const crypto of detail.crypto ?? []) {
    map.set(crypto.symbol.toUpperCase(), {
      symbol: crypto.symbol.toUpperCase(),
      price: crypto.price,
      change24h: crypto.change,
    });
  }

  return symbols
    .map((symbol) => map.get(symbol))
    .filter((item): item is TickerItem => !!item);
}

export function formatTickerPrice(price: number): string {
  if (price >= 1000) return `$${(price / 1000).toFixed(1)}K`;
  return `$${price.toFixed(2)}`;
}

export class MarketTicker {
  private readonly container: HTMLElement;
  private readonly symbols: string[];
  private readonly onUpdate: EventListener;

  constructor(container: HTMLElement, options: MarketTickerOptions = {}) {
    this.container = container;
    this.symbols = options.symbols ?? DEFAULT_SYMBOLS;
    this.onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<MarketTickerEventDetail>).detail;
      this.updateFromDetail(detail);
    };
  }

  public mount(): void {
    this.renderShell();
    window.addEventListener('market-data-updated', this.onUpdate);
  }

  public destroy(): void {
    window.removeEventListener('market-data-updated', this.onUpdate);
  }

  private renderShell(): void {
    this.container.innerHTML = `
      <div class="market-ticker" role="status" aria-live="polite">
        <div class="market-ticker-label">📊 Markets</div>
        <div class="market-ticker-prices" id="marketTickerPrices">
          ${this.symbols.map((symbol) => `
            <div class="market-ticker-item loading">
              <span class="market-ticker-symbol">${symbol}</span>
              <span class="market-ticker-price">...</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private updateFromDetail(detail?: MarketTickerEventDetail): void {
    const selected = toTickerItems(detail, this.symbols);
    if (selected.length === 0) return;

    const pricesEl = this.container.querySelector<HTMLElement>('#marketTickerPrices');
    if (!pricesEl) return;

    pricesEl.innerHTML = selected.map((item) => this.renderItem(item)).join('');
  }

  private renderItem(item: TickerItem): string {
    const up = item.change24h >= 0;
    const sign = up ? '+' : '';
    const cls = up ? 'positive' : 'negative';

    return `
      <div class="market-ticker-item ${cls}">
        <span class="market-ticker-symbol">${item.symbol}</span>
        <span class="market-ticker-price">${formatTickerPrice(item.price)}</span>
        <span class="market-ticker-change">${sign}${item.change24h.toFixed(2)}%</span>
      </div>
    `;
  }

}
