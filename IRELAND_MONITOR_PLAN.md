# Ireland Monitor - 项目计划书

## 1. 项目概述

基于 **worldmonitor** (4万星开源项目) 构建专注于爱尔兰的本地化情报面板。

### 定位
**爱尔兰一站式信息聚合平台** — 新闻、政策、房产、教育、生活信息的 AI 智能汇总

### 目标用户
- 在爱尔兰生活的华人（主要）
- 关注爱尔兰投资/移民的人群
- 研究爱尔兰的学者/商务人士

---

## 2. 核心功能模块

### 2.1 新闻聚合 (News)
| 分类 | 数据源 |
|------|--------|
| 主流媒体 | RTÉ News, Irish Times, Irish Independent, TheJournal.ie |
| 财经 | Irish Examiner Business, Business Post |
| 科技 | Silicon Republic, Tech Central |
| 体育 | RTÉ Sport, The42.ie |
| 地方 | Cork Beo, Dublin Live, Galway Daily |

### 2.2 政策追踪 (Policy)
| 来源 | 内容 |
|------|------|
| gov.ie | 政府公告、政策变更 |
| INIS | 签证政策、移民通知 |
| Revenue | 税务政策更新 |
| Citizens Information | 福利政策变更 |
| Oireachtas | 议会动态、立法进程 |

### 2.3 房产市场 (Property)
| 数据源 | 内容 |
|------|------|
| Daft.ie | 租房/买房价格趋势 |
| MyHome.ie | 房价指数 |
| RTB | 租金上限、租户权利更新 |
| CSO | 官方房价统计 |

### 2.4 教育资源 (Education)
| 来源 | 内容 |
|------|------|
| 大学公告 | TCD, UCD, DCU, UCC, NUIG, UL 等 |
| 奖学金 | Government of Ireland Scholarships, SFI |
| 语言学校 | MEI, ILEP 认证学校动态 |
| 签证 | 学生签证政策更新 |

### 2.5 生活服务 (Living)
| 分类 | 内容 |
|------|------|
| 交通 | Irish Rail, Dublin Bus, Luas 服务公告 |
| 天气 | Met Éireann 预警 |
| 健康 | HSE 公告 |
| 活动 | 本地华人社区活动、节日活动 |

---

## 3. 技术方案

### 3.1 基于 worldmonitor 的改造

```
worldmonitor/                    ireland-monitor/
├── api/                    →    ├── api/
│   ├── news/              →    │   ├── ireland-news/     # 爱尔兰新闻 API
│   ├── finance/           →    │   ├── ireland-property/ # 房产数据 API
│   └── ...                →    │   ├── ireland-policy/   # 政策追踪 API
├── src/                         │   └── ireland-edu/      # 教育资源 API
│   ├── feeds/             →    ├── src/
│   └── components/        →    │   ├── feeds/ireland/    # 爱尔兰数据源
├── shared/                →    │   └── components/       # UI 组件（复用）
│   └── rss-allowed-domains.json  → 添加爱尔兰域名
└── data/                  →    └── data/ireland/        # 爱尔兰静态数据
```

### 3.2 新增爱尔兰 RSS 源

```javascript
// shared/rss-allowed-domains-ireland.json
[
  // 主流媒体
  "www.rte.ie",
  "www.irishtimes.com",
  "www.independent.ie",
  "www.thejournal.ie",
  "www.irishexaminer.com",
  
  // 政府
  "www.gov.ie",
  "www.irishimmigration.ie",
  "www.revenue.ie",
  "www.citizensinformation.ie",
  "www.oireachtas.ie",
  
  // 房产
  "www.daft.ie",
  "www.myhome.ie",
  "www.rtb.ie",
  
  // 科技
  "www.siliconrepublic.com",
  "www.techcentral.ie",
  
  // 大学
  "www.tcd.ie",
  "www.ucd.ie",
  "www.dcu.ie",
  "www.ucc.ie",
  "www.nuigalway.ie",
  "www.ul.ie"
]
```

### 3.3 中文翻译层

```typescript
// 使用 AI 翻译关键内容
interface TranslationConfig {
  enabled: boolean;
  targetLang: "zh-CN" | "zh-TW";
  translateFields: ["title", "summary"];
  aiProvider: "ollama" | "groq" | "openrouter";
}
```

---

## 4. 开发计划

### Phase 1: 基础框架 (1周)
- [x] Fork worldmonitor 项目
- [ ] 重命名为 ireland-monitor
- [ ] 更新 branding (logo, colors, name)
- [ ] 配置开发环境

### Phase 2: 新闻源接入 (1周)
- [ ] 添加爱尔兰 RSS 源配置
- [ ] 实现新闻分类（主流/财经/科技/体育/地方）
- [ ] 测试 RSS 抓取

### Phase 3: 特色功能 (2周)
- [ ] 房产数据抓取 (Daft.ie API 或爬虫)
- [ ] 政策追踪 (gov.ie RSS)
- [ ] 教育资源聚合

### Phase 4: 中文化 (1周)
- [ ] AI 翻译集成
- [ ] 中文 UI
- [ ] 双语切换

### Phase 5: 部署上线 (1周)
- [ ] Vercel 部署
- [ ] 域名配置 (irelandmonitor.app / ie-monitor.com)
- [ ] 性能优化

---

## 5. 技术栈（继承 worldmonitor）

| 层 | 技术 |
|----|------|
| 前端 | Vanilla TypeScript, Vite |
| 可视化 | globe.gl, deck.gl, MapLibre |
| 桌面端 | Tauri 2 (可选) |
| AI | Ollama / Groq / OpenRouter |
| 部署 | Vercel Edge Functions |
| 缓存 | Redis (Upstash) |

---

## 6. 预算估算

| 项目 | 成本 |
|------|------|
| 域名 | ~€15/年 |
| Vercel | 免费 (Hobby) 或 $20/月 (Pro) |
| Upstash Redis | 免费 (10K requests/day) |
| AI API | 可用 Ollama 本地免费 |
| **总计** | **€15-€255/年** |

---

## 7. 风险与边界

### 风险
- Daft.ie/MyHome.ie 可能没有公开 API，需要考虑爬虫法律问题
- 部分政府网站 RSS 支持不完善
- 翻译质量需要人工审核

### 不做的事
- 不做用户注册/登录系统（第一版）
- 不做社区/评论功能
- 不做付费订阅

---

## 8. 下一步

1. **确认项目名称**: ireland-monitor / ie-monitor / 爱岛通 ?
2. **确认优先级**: 先做新闻聚合还是房产追踪？
3. **确认域名**: 是否需要现在注册？

---

*Generated: 2026-03-17*
