import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTickerPrice, toTickerItems, type MarketTickerEventDetail } from '@/components/MarketTicker';

describe('market-ticker helpers', () => {
  it('builds ticker items in symbol order', () => {
    const detail: MarketTickerEventDetail = {
      markets: [{ symbol: '^IXIC', name: 'NASDAQ', display: 'NDX', price: 20000, change: 1.23 }],
      crypto: [{ symbol: 'btc', name: 'Bitcoin', price: 70800, change: -0.45 }],
    };

    const items = toTickerItems(detail, ['BTC', 'NDX']);
    assert.equal(items.length, 2);
    assert.equal(items[0]?.symbol, 'BTC');
    assert.equal(items[1]?.symbol, 'NDX');
  });

  it('skips invalid market values', () => {
    const detail: MarketTickerEventDetail = {
      markets: [{ symbol: '^IXIC', name: 'NASDAQ', display: 'NDX', price: null, change: null }],
    };
    const items = toTickerItems(detail, ['NDX']);
    assert.equal(items.length, 0);
  });

  it('formats prices for UI', () => {
    assert.equal(formatTickerPrice(70800), '$70.8K');
    assert.equal(formatTickerPrice(99.5), '$99.50');
  });
});
