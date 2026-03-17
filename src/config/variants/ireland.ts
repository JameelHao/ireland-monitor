// Ireland Tech variant - IrishTech Daily
import type { PanelConfig, MapLayers } from '@/types';
import type { VariantConfig } from './base';

// Re-export base config
export * from './base';

// Ireland-specific FEEDS configuration
import type { Feed } from '@/types';
import { rssProxyUrl } from '@/utils';

const rss = rssProxyUrl;

export const FEEDS: Record<string, Feed[]> = {
  // 爱尔兰科技新闻
  ieTech: [
    { name: 'Silicon Republic', url: rss('https://www.siliconrepublic.com/feed') },
    { name: 'Tech Central', url: rss('https://www.techcentral.ie/feed/') },
    { name: 'Business Plus', url: rss('https://businessplus.ie/feed/') },
    { name: 'Irish Tech News', url: rss('https://irishtechnews.ie/feed/') },
  ],

  // 爱尔兰学术机构（通过 Google News）
  ieAcademic: [
    { 
      name: 'TCD News', 
      url: rss('https://news.google.com/rss/search?q=site:tcd.ie+when:7d&hl=en-IE&gl=IE&ceid=IE:en') 
    },
    { 
      name: 'UCD News', 
      url: rss('https://news.google.com/rss/search?q=site:ucd.ie+when:7d&hl=en-IE&gl=IE&ceid=IE:en') 
    },
    { 
      name: 'SFI Announcements', 
      url: rss('https://news.google.com/rss/search?q=site:sfi.ie+when:7d&hl=en-IE&gl=IE&ceid=IE:en') 
    },
    { 
      name: 'Enterprise Ireland', 
      url: rss('https://news.google.com/rss/search?q=site:enterprise-ireland.com+when:7d&hl=en-IE&gl=IE&ceid=IE:en') 
    },
  ],

  // 全球科技新闻（复用）
  tech: [
    { name: 'TechCrunch', url: rss('https://techcrunch.com/feed/') },
    { name: 'Hacker News', url: rss('https://hnrss.org/frontpage') },
    { name: 'The Verge', url: rss('https://www.theverge.com/rss/index.xml') },
  ],

  // AI/ML
  ai: [
    { name: 'AI News', url: rss('https://news.google.com/rss/search?q=(OpenAI+OR+Anthropic+OR+Google+AI+OR+"AI+model")+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'ArXiv AI', url: rss('https://export.arxiv.org/rss/cs.AI') },
    { name: 'ArXiv ML', url: rss('https://export.arxiv.org/rss/cs.LG') },
  ],

  // 欧洲创业生态
  startups: [
    { name: 'EU Startups', url: rss('https://www.eu-startups.com/feed/') },
    { name: 'Tech.eu', url: rss('https://tech.eu/feed/') },
    { name: 'Sifted (Europe)', url: rss('https://sifted.eu/feed') },
    { name: 'TechCrunch Startups', url: rss('https://techcrunch.com/category/startups/feed/') },
  ],

  // 爱尔兰商业新闻
  ieBusiness: [
    { name: 'Irish Times Business', url: rss('https://www.irishtimes.com/business/rss') },
    { name: 'Irish Independent Business', url: rss('https://www.independent.ie/business/rss') },
    { name: 'RTE Business', url: rss('https://www.rte.ie/feeds/business/') },
  ],
};

// Ireland variant panels
export const PANELS: Record<string, PanelConfig> = {
  ieTech: { name: 'Irish Tech', enabled: true, priority: 1 },
  ieAcademic: { name: 'Academia', enabled: true, priority: 2 },
  tech: { name: 'Global Tech', enabled: true, priority: 3 },
  ai: { name: 'AI/ML', enabled: true, priority: 4 },
  startups: { name: 'Startups', enabled: true, priority: 5 },
  ieBusiness: { name: 'Business', enabled: true, priority: 6 },
};

// Ireland variant config
export const VARIANT_CONFIG: VariantConfig = {
  variant: 'ireland',
  name: 'IrishTech Daily',
  description: "Ireland's tech pulse, daily",
  defaultView: 'eu',
  defaultPanels: ['ieTech', 'ieAcademic', 'tech', 'ai', 'startups'],
};
