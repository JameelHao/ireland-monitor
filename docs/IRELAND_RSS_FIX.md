# Ireland Monitor RSS Feed 修复

**问题**: Ireland Tech News 面板显示 "No items" 或过时新闻

**原因**: Silicon Republic 等爱尔兰科技网站的 RSS feed 返回 502 错误

**解决**: 改用 Google News RSS

---

## 修改内容

### 1. `src/config/variants/ireland.ts`

**修改前**:
```typescript
{ name: 'Silicon Republic', url: rss('https://www.siliconrepublic.com/feed') }
```

**修改后**:
```typescript
{ name: 'Silicon Republic (Google News)', 
  url: rss('https://news.google.com/rss/search?q=site:siliconrepublic.com+technology+when:2d') }
```

### 2. `api/rss-proxy.js`

移除了 `RELAY_ONLY_DOMAINS` 中的:
- `www.siliconrepublic.com`
- `www.techcentral.ie`
- `businessplus.ie`

因为现在通过 Google News RSS 获取，不再直接访问这些网站。

---

## 为什么有效？

1. **Google News 稳定** - 几乎不会被封或返回 502
2. **无需 Railway relay** - 不依赖 `WS_RELAY_URL` 环境变量
3. **更快** - Google 的 CDN 分发
4. **自动聚合** - Google News 已经聚合了内容

---

## 测试

```bash
# 测试 Google News RSS
curl "https://news.google.com/rss/search?q=site:siliconrepublic.com+technology+when:2d" | grep "<title>"

# 应该返回最近 2 天的新闻标题
```

---

*日期: 2026-04-03*
*FR #198*
