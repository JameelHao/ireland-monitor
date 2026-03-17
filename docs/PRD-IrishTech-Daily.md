# PRD: IrishTech Daily - 爱尔兰科技圈情报平台

**版本**: 1.0  
**日期**: 2026-03-17  
**作者**: Product Manager Agent  
**状态**: Draft

---

## 1. 产品概述

### 1.1 背景

爱尔兰是欧洲重要的科技中心（Google、Meta、Apple 欧洲总部），但缺乏本地化的科技情报聚合平台。现有的信息获取方式分散（需要分别访问 Silicon Republic、Tech Central、大学网站、峰会官网等），效率低下。

**问题陈述**：
- 科技从业者想了解爱尔兰本地科技动态，需要访问 10+ 网站
- arXiv、Hacker News、M&A 新闻是全球的，缺少爱尔兰筛选视角
- 没有统一的爱尔兰科技峰会日历

### 1.2 产品定位

**一句话定位**：  
*"爱尔兰科技圈的每日简报 - 5 分钟了解本地科技动态"*

**核心价值**：
1. **本地化聚合** - 爱尔兰科技新闻 + 全球科技动态（爱尔兰相关筛选）
2. **学术前沿追踪** - arXiv 论文 + 爱尔兰大学研究公告
3. **商业情报** - M&A、IPO、裁员、融资（爱尔兰公司优先）
4. **峰会日历** - Dublin Tech Summit、Web Summit 等本地活动

### 1.3 目标用户

**主目标用户**：爱尔兰科技从业者
- 年龄：25-40 岁
- 职业：工程师、PM、设计师、研究员
- 痛点：想了解本地科技圈动态，但信息分散
- 使用场景：每天早上 10 分钟浏览科技动态

**次要用户**：
- 投资人：关注爱尔兰科技公司融资、M&A
- 学术人员：追踪 TCD/UCD/SFI 研究动态

### 1.4 成功指标

| 指标 | 目标（3 个月后） |
|------|------------------|
| 日活用户 | 100+ |
| 留存率（D7） | 30% |
| 平均停留时间 | 5 分钟 |
| 数据源覆盖 | 20+ RSS 源 |

---

## 2. 功能需求（MVP）

### 2.1 核心功能模块

| 模块 | 优先级 | 说明 |
|------|--------|------|
| 科技新闻 | 🔴 P0 | Silicon Republic + Tech Central + Hacker News |
| 学术研究 | 🔴 P0 | arXiv AI/ML + TCD/UCD/SFI 公告 |
| M&A/融资 | 🔴 P0 | IPO、裁员、收购（爱尔兰公司优先） |
| 峰会日历 | 🟡 P1 | Dublin Tech Summit、Web Summit |
| 地图可视化 | 🟡 P1 | 聚焦爱尔兰视角的 3D 地球 |

### 2.2 数据源清单

#### P0（必须有）
| 分类 | 数据源 | RSS 可用 | 备注 |
|------|--------|----------|------|
| 科技新闻 | Silicon Republic | ✅ | https://www.siliconrepublic.com/feed |
| 科技新闻 | Tech Central | ✅ | https://www.techcentral.ie/feed/ |
| 科技新闻 | Hacker News | ✅ | 已有（worldmonitor） |
| 学术 | arXiv AI | ✅ | 已有（worldmonitor） |
| 学术 | arXiv ML | ✅ | 已有（worldmonitor） |
| 学术 | TCD News | ❌ | 用 Google News 包装 |
| 学术 | UCD News | ❌ | 用 Google News 包装 |
| 学术 | SFI Announcements | ❌ | 用 Google News 包装 |
| M&A | Layoffs.fyi | ✅ | 已有（worldmonitor） |
| M&A | Crunchbase News | ✅ | 已有（worldmonitor） |
| M&A | TechCrunch IPO | ✅ | 已有（worldmonitor） |

#### P1（可选）
| 分类 | 数据源 | RSS 可用 | 备注 |
|------|--------|----------|------|
| 峰会 | Dublin Tech Summit | ✅ | https://dublintechsummit.tech/feed/ |
| VC/融资 | Enterprise Ireland | ❌ | 用 Google News 包装 |
| VC/融资 | NDRC | ❌ | 用 Google News 包装 |

### 2.3 地图可视化需求

**目标**：用户一打开，看到聚焦爱尔兰的 3D 地球

**改动点**：
1. **默认视角** - 改为都柏林中心（lat: 53.35, lng: -6.26, altitude: 0.3）
2. **视图选项** - 改为：Ireland | Dublin | Cork | Galway（去掉其他大洲）
3. **数据点过滤** - 优先显示爱尔兰相关新闻点
4. **（可选）底图遮罩** - 淡化非爱尔兰区域

**不做**（Phase 2 再考虑）：
- 完全重绘地图底图
- 去掉地球改用平面地图

---

## 3. 技术方案

### 3.1 基于 worldmonitor 改造

**保留的模块**（直接复用）：
- ✅ RSS 聚合引擎
- ✅ AI 摘要（Ollama/Groq）
- ✅ globe.gl 3D 地球
- ✅ arXiv、Hacker News、IPO/M&A、Layoffs 数据源

**新增的模块**：
- 🆕 `IRELAND_FEEDS` 配置（`src/config/feeds.ts`）
- 🆕 爱尔兰视图配置（`src/components/GlobeMap.ts`）
- 🆕 爱尔兰数据点过滤逻辑

**去掉的模块**：
- ❌ 地缘政治新闻源（Middle East、Africa、LATAM 等）
- ❌ 军事情报模块（Intel、Bases、Conflict Zones）
- ❌ 全球视图按钮（改为爱尔兰视图）

### 3.2 数据源配置改造

**文件**：`src/config/feeds.ts`

```typescript
// 新增爱尔兰 feeds 配置
const IRELAND_FEEDS: Record<string, Feed[]> = {
  // 爱尔兰科技新闻
  ieTech: [
    { name: 'Silicon Republic', url: rss('https://www.siliconrepublic.com/feed') },
    { name: 'Tech Central', url: rss('https://www.techcentral.ie/feed/') },
  ],
  
  // 爱尔兰学术
  ieAcademic: [
    { name: 'TCD News', url: rss('https://news.google.com/rss/search?q=site:tcd.ie+when:7d&hl=en-IE&gl=IE&ceid=IE:en') },
    { name: 'UCD News', url: rss('https://news.google.com/rss/search?q=site:ucd.ie+when:7d&hl=en-IE&gl=IE&ceid=IE:en') },
    { name: 'SFI News', url: rss('https://news.google.com/rss/search?q=site:sfi.ie+when:7d&hl=en-IE&gl=IE&ceid=IE:en') },
  ],
  
  // 爱尔兰峰会
  ieSummits: [
    { name: 'Dublin Tech Summit', url: rss('https://dublintechsummit.tech/feed/') },
  ],
  
  // 复用全球科技源（但加爱尔兰关键词过滤）
  tech: TECH_FEEDS.tech,  // Hacker News, TechCrunch, Ars Technica
  ai: TECH_FEEDS.ai,      // arXiv AI/ML, MIT Tech Review AI
  startups: TECH_FEEDS.startups,  // Crunchbase, VentureBeat
  layoffs: FULL_FEEDS.layoffs,    // Layoffs.fyi
};

// 修改 variant 判断
export const FEEDS = SITE_VARIANT === 'ireland'
  ? IRELAND_FEEDS
  : SITE_VARIANT === 'tech'
    ? TECH_FEEDS
    : FULL_FEEDS;
```

### 3.3 地图视角改造

**文件**：`src/components/GlobeMap.ts`

```typescript
// 修改视角配置（第 2437 行）
private static readonly VIEW_POVS: Record<MapView, { lat: number; lng: number; altitude: number }> = {
  ireland:  { lat: 53.35, lng: -6.26, altitude: 0.25 },  // 爱尔兰全景
  dublin:   { lat: 53.35, lng: -6.26, altitude: 0.15 },  // 都柏林
  cork:     { lat: 51.90, lng: -8.47, altitude: 0.15 },  // 科克
  galway:   { lat: 53.27, lng: -9.05, altitude: 0.15 },  // 戈尔韦
  global:   { lat: 53.35, lng: -6.26, altitude: 0.3 },   // 默认也改成爱尔兰
};
```

**文件**：`src/components/MapContainer.ts`

```typescript
// 修改 MapView 类型定义（第 49 行）
export type MapView = 'ireland' | 'dublin' | 'cork' | 'galway';
```

### 3.4 数据点过滤逻辑

**文件**：`src/components/GlobeMap.ts`

```typescript
// 在 flushMarkers() 方法中加入爱尔兰优先逻辑
private flushMarkers(): void {
  // ... 原有代码
  
  // 过滤：优先显示爱尔兰相关新闻
  const irelandMarkers = markers.filter(m => 
    isIrelandRelated(m.lat, m.lng, m.country, m.content)
  );
  
  this.globe.htmlElementsData(irelandMarkers);
}

// 新增爱尔兰相关判断函数
function isIrelandRelated(
  lat: number, 
  lng: number, 
  country?: string, 
  content?: string
): boolean {
  // 地理位置在爱尔兰附近
  if (lat >= 51.0 && lat <= 56.0 && lng >= -11.0 && lng <= -5.0) return true;
  
  // 国家是爱尔兰
  if (country === 'Ireland' || country === 'IE') return true;
  
  // 内容包含爱尔兰相关关键词
  const ieKeywords = ['Ireland', 'Dublin', 'Cork', 'Galway', 'Irish', 'TCD', 'UCD', 'SFI'];
  return ieKeywords.some(kw => content?.includes(kw));
}
```

---

## 4. UI/UX 改动

### 4.1 品牌更新

| 元素 | 原值（worldmonitor） | 新值（IrishTech Daily） |
|------|----------------------|-------------------------|
| 产品名称 | World Monitor | IrishTech Daily |
| 主色调 | 蓝色（地缘政治） | 绿色（爱尔兰国色） |
| Logo | 地球图标 | 爱尔兰地图轮廓 |
| Slogan | "Real-time global intelligence" | "Ireland's tech pulse, daily" |

### 4.2 首页布局调整

**原 worldmonitor 首页**：
```
+------------------------+
| 地球（全球视角）         |
| 新闻列表（全球政治）      |
+------------------------+
```

**IrishTech Daily 首页**：
```
+------------------------+
| 地球（爱尔兰视角）        |
| 科技新闻（爱尔兰优先）    |
| 学术研究（TCD/UCD）      |
| M&A 动态                |
+------------------------+
```

### 4.3 分类标签调整

| 原分类 | 新分类 |
|--------|--------|
| Politics | Irish Tech |
| Middle East | Academic |
| US | M&A / Funding |
| Europe | Summits |
| Tech | Global Tech |

---

## 5. 开发计划

### Phase 1: 基础框架（Week 1）

**目标**：地图视角改成爱尔兰 + 品牌更新

| 任务 | 工作量 | 验收标准 |
|------|--------|----------|
| 修改地图默认视角 | 30 分钟 | 打开网站，地球聚焦都柏林 |
| 改 MapView 类型 | 10 分钟 | 视图选项只有 Ireland/Dublin/Cork/Galway |
| 更新产品名称 | 1 小时 | 所有页面显示 "IrishTech Daily" |
| 修改主色调为绿色 | 2 小时 | CSS 变量改为爱尔兰绿 |

**里程碑**：地图本地化完成

---

### Phase 2: 数据源接入（Week 2）

**目标**：接入爱尔兰科技新闻源

| 任务 | 工作量 | 验收标准 |
|------|--------|----------|
| 配置 IRELAND_FEEDS | 1 小时 | feeds.ts 中新增爱尔兰源 |
| 添加 Silicon Republic | 30 分钟 | 新闻列表显示 SR 文章 |
| 添加 Tech Central | 30 分钟 | 新闻列表显示 TC 文章 |
| 添加 TCD/UCD/SFI（Google News） | 1 小时 | 学术版块显示大学新闻 |
| 测试 RSS 抓取 | 2 小时 | 所有源正常更新 |

**里程碑**：爱尔兰数据源上线

---

### Phase 3: 数据点过滤（Week 3）

**目标**：地图只显示爱尔兰相关新闻点

| 任务 | 工作量 | 验收标准 |
|------|--------|----------|
| 实现 isIrelandRelated() | 30 分钟 | 函数正确判断爱尔兰相关性 |
| 修改 flushMarkers() | 30 分钟 | 地图只显示爱尔兰点 |
| 测试地图数据点 | 1 小时 | 点击标记显示正确新闻 |

**里程碑**：地图数据本地化完成

---

### Phase 4: 峰会日历（Week 4）

**目标**：添加爱尔兰科技峰会日历

| 任务 | 工作量 | 验收标准 |
|------|--------|----------|
| 添加 Dublin Tech Summit 源 | 30 分钟 | 峰会列表显示活动 |
| 添加峰会日历 UI | 2 小时 | 日历视图展示峰会日期 |
| 测试峰会数据 | 1 小时 | 数据正确显示 |

**里程碑**：MVP 功能完整

---

### Phase 5: 部署上线（Week 5）

**目标**：Vercel 部署 + 域名配置

| 任务 | 工作量 | 验收标准 |
|------|--------|----------|
| Vercel 部署配置 | 1 小时 | 生产环境正常运行 |
| 域名配置 | 30 分钟 | irishtechdaily.com 可访问 |
| 性能优化 | 2 小时 | Lighthouse 分数 > 90 |
| 文档更新 | 1 小时 | README 更新为 IrishTech Daily |

**里程碑**：产品上线

---

## 6. 验收标准

### 6.1 功能验收

| 功能 | 验收标准 |
|------|----------|
| 地图视角 | 打开网站，默认聚焦爱尔兰都柏林 |
| 科技新闻 | 显示 Silicon Republic + Tech Central 最新文章 |
| 学术研究 | 显示 arXiv AI/ML + TCD/UCD 公告 |
| M&A 动态 | 显示 Layoffs、IPO、融资新闻 |
| 地图数据点 | 只显示爱尔兰相关新闻标记 |
| 视图切换 | Ireland / Dublin / Cork / Galway 视图正常 |

### 6.2 性能验收

| 指标 | 目标 |
|------|------|
| 首屏加载时间 | < 3 秒 |
| Lighthouse Performance | > 90 |
| RSS 更新频率 | 每 15 分钟 |
| 地图渲染帧率 | > 30 fps |

### 6.3 兼容性验收

| 平台 | 要求 |
|------|------|
| Desktop（Chrome/Firefox/Safari） | 完整功能 |
| Mobile（iOS/Android） | 响应式布局 |
| Tauri 桌面端（可选） | 原生性能 |

---

## 7. 风险与依赖

### 7.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| TCD/UCD 无 RSS | 🟡 中 | 用 Google News 包装 |
| 地图性能（移动端） | 🟡 中 | 降低渲染分辨率 |
| AI 摘要质量 | 🟢 低 | 调整 prompt |

### 7.2 数据源风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Silicon Republic RSS 挂了 | 🔴 高 | 降级到 Google News |
| Daft.ie 无 API（Phase 2） | 🟡 中 | 爬虫方案 |
| 峰会数据不实时 | 🟢 低 | 人工补充 |

### 7.3 依赖项

- worldmonitor 上游更新（可能冲突）
- Vercel 免费额度（10K requests/day）
- Ollama 本地部署（或 Groq API）

---

## 8. 后续扩展（Phase 2+）

### 8.1 功能扩展

- 🔮 AI 智能摘要（爱尔兰公司名识别）
- 🔮 中文翻译（华人用户）
- 🔮 邮件订阅（每日简报）
- 🔮 Slack/Telegram 机器人

### 8.2 数据源扩展

- 🔮 Enterprise Ireland 资助公告
- 🔮 NDRC 加速器动态
- 🔮 爱尔兰 VC 投资数据
- 🔮 GitHub 爱尔兰开发者活动

---

## 9. 附录

### 9.1 参考资料

- [worldmonitor GitHub](https://github.com/koala73/worldmonitor)
- [Silicon Republic](https://www.siliconrepublic.com/)
- [Tech Central](https://www.techcentral.ie/)
- [TCD News](https://www.tcd.ie/news/)

### 9.2 相关文档

- [ARCHITECTURE.md](../ARCHITECTURE.md) - worldmonitor 架构说明
- [CONTRIBUTING.md](../CONTRIBUTING.md) - 开发指南

---

**PRD 审批**：
- [ ] 产品经理确认
- [ ] 技术负责人确认
- [ ] 开始开发

*Version 1.0 - 2026-03-17*
