# FR #006: Vercel 部署 + 域名配置

## 背景

IrishTech Daily 开发完成后，需要部署到生产环境，让用户可以访问。

## 目标

- 网站部署到 Vercel（或其他托管平台）
- 配置自定义域名（如 irishtechdaily.com）
- 性能优化（Lighthouse 分数 > 90）

## 技术方案

### 1. Vercel 部署配置

**文件**: `vercel.json` (新建或修改)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SITE_VARIANT": "ireland",
    "VITE_AI_PROVIDER": "groq"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=300, stale-while-revalidate" }
      ]
    }
  ]
}
```

### 2. 环境变量配置

**Vercel Dashboard → Settings → Environment Variables**

```bash
VITE_SITE_VARIANT=ireland
VITE_AI_PROVIDER=groq
GROQ_API_KEY=<secret>
REDIS_URL=<upstash-redis-url>
```

### 3. 域名配置

**选项 A**: 购买新域名
- irishtechdaily.com
- irishtech.daily
- ie-monitor.com

**选项 B**: 使用 Vercel 免费域名
- irishtechdaily.vercel.app

**DNS 配置** (如果用自定义域名):
```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

### 4. 性能优化

**Lighthouse 目标**:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

**优化措施**:
1. 启用 gzip/brotli 压缩
2. 图片懒加载
3. CSS/JS 代码分割
4. Service Worker 缓存（可选）
5. CDN 加速（Vercel 自带）

### 5. 监控与分析

**集成 Vercel Analytics**:
```typescript
// src/main.ts
import { inject } from '@vercel/analytics';
inject();
```

**集成 Plausible / Google Analytics** (可选):
```html
<script defer data-domain="irishtechdaily.com" src="https://plausible.io/js/script.js"></script>
```

## 验收标准

- [ ] 网站可通过域名访问（https://irishtechdaily.com 或 .vercel.app）
- [ ] SSL 证书正常（HTTPS）
- [ ] Lighthouse Performance > 90
- [ ] 首屏加载时间 < 3 秒
- [ ] 所有功能正常（地图、新闻、峰会日历）
- [ ] RSS 更新正常（每 15 分钟）
- [ ] 移动端/桌面端都正常

## 部署流程

```bash
# 1. 本地测试生产构建
npm run build
npm run preview

# 2. 推送到 GitHub
git push origin main

# 3. Vercel 自动部署（如果已配置 CI/CD）
# 或手动部署
vercel --prod

# 4. 验证部署
curl https://irishtechdaily.vercel.app
```

## 工作量估算

- Vercel 配置: 30 分钟
- 环境变量配置: 15 分钟
- 域名购买 + DNS 配置: 1 小时（如果需要）
- 性能优化: 2 小时
- 测试生产环境: 1 小时
- 文档更新: 30 分钟

**总计**: 5 小时

## 依赖

- FR #001 - #005 (所有功能开发完成)

## 风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Vercel 免费额度不够 | 🟡 中 | 升级 Pro ($20/月) 或迁移到其他平台 |
| 域名被占用 | 🟢 低 | 备选域名列表 |
| 构建失败 | 🟡 中 | 本地测试 `npm run build` |
| 性能不达标 | 🟡 中 | 分阶段优化 |

## 后续运维

- 监控 Vercel 部署日志
- 每周检查 Lighthouse 分数
- 监控 Upstash Redis 使用量
- 定期备份配置和数据

## 优先级

🔴 **P0 - 必须完成** (Phase 5 - Week 5)

---

*Related: PRD Section 5.5*
