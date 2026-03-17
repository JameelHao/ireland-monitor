# FR #003: 爱尔兰数据源接入

## 背景

worldmonitor 的数据源是全球新闻，需要新增爱尔兰本地科技媒体和学术机构的 RSS 源。

## 目标

新闻列表显示 Silicon Republic、Tech Central、TCD、UCD、SFI 等爱尔兰本地源的内容。

## 技术方案

### 1. 新增 IRELAND_FEEDS 配置

**文件**: `src/config/feeds.ts`

```typescript
const IRELAND_FEEDS: Record<string, Feed[]> = {
  // 爱尔兰科技新闻
  ieTech: [
    { name: 'Silicon Republic', url: rss('https://www.siliconrepublic.com/feed') },
    { name: 'Tech Central', url: rss('https://www.techcentral.ie/feed/') },
  ],
  
  // 爱尔兰学术（使用 Google News 包装）
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
  ],
  
  // 复用全球科技源
  tech: TECH_FEEDS.tech,        // Hacker News, TechCrunch
  ai: TECH_FEEDS.ai,            // arXiv AI/ML
  startups: TECH_FEEDS.startups, // Crunchbase
  layoffs: FULL_FEEDS.layoffs,   // Layoffs.fyi
};

// 修改 variant 导出
export const FEEDS = SITE_VARIANT === 'ireland'
  ? IRELAND_FEEDS
  : SITE_VARIANT === 'tech'
    ? TECH_FEEDS
    : FULL_FEEDS;
```

### 2. 配置 SITE_VARIANT

**文件**: `src/config/variant.ts` (或环境变量)

```typescript
export const SITE_VARIANT = 'ireland';
```

或使用环境变量:
```bash
VITE_SITE_VARIANT=ireland
```

### 3. 更新 RSS allowed domains

**文件**: `shared/rss-allowed-domains.json`

添加爱尔兰域名:
```json
[
  "www.siliconrepublic.com",
  "www.techcentral.ie",
  "www.tcd.ie",
  "www.ucd.ie",
  "www.sfi.ie",
  "dublintechsummit.tech"
]
```

### 4. 测试 RSS 抓取

使用脚本验证所有源可访问:
```bash
npm run validate-rss-feeds
```

## 验收标准

- [ ] 新闻列表显示 Silicon Republic 最新文章
- [ ] 新闻列表显示 Tech Central 最新文章
- [ ] 学术版块显示 TCD/UCD/SFI 新闻（通过 Google News）
- [ ] Hacker News、arXiv、Layoffs 等全球源正常工作
- [ ] RSS 更新频率：每 15 分钟
- [ ] 所有源的文章能正常点击跳转

## 工作量估算

- 配置 IRELAND_FEEDS: 1 小时
- 更新 allowed domains: 30 分钟
- 配置 SITE_VARIANT: 15 分钟
- 测试所有 RSS 源: 2 小时
- 修复失败的源: 1 小时（预留）

**总计**: 4.5 小时

## 依赖

- FR #002 (品牌更新) - 需要确认 variant 配置路径

## 风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| TCD/UCD RSS 不稳定 | 🟡 中 | 降级到纯 Google News |
| Google News 限流 | 🟡 中 | 增加缓存时间 |
| Silicon Republic 改版 | 🟢 低 | RSS 格式通常稳定 |

## 优先级

🔴 **P0 - 必须完成** (Phase 2 - Week 2)

---

*Related: PRD Section 5.2*
