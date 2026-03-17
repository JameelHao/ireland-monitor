# FR #005: 峰会日历 - Dublin Tech Summit & Web Summit

## 背景

爱尔兰科技从业者需要关注本地和欧洲的重要科技峰会，如 Dublin Tech Summit、Web Summit、Collision 等。

## 目标

在 IrishTech Daily 中添加峰会日历模块，显示即将举办的爱尔兰相关科技峰会。

## 技术方案

### 1. 新增峰会数据源

**文件**: `src/config/feeds.ts` (在 IRELAND_FEEDS 中添加)

```typescript
// 爱尔兰峰会
ieSummits: [
  { 
    name: 'Dublin Tech Summit', 
    url: rss('https://dublintechsummit.tech/feed/') 
  },
  { 
    name: 'Web Summit (Lisbon)', 
    url: rss('https://news.google.com/rss/search?q="Web+Summit"+when:30d&hl=en-IE&gl=IE&ceid=IE:en') 
  },
  { 
    name: 'Collision (Toronto)', 
    url: rss('https://news.google.com/rss/search?q="Collision+conference"+when:30d&hl=en-IE&gl=IE&ceid=IE:en') 
  },
],
```

### 2. 新增峰会日历 UI 组件

**文件**: `src/components/SummitCalendar.ts` (新建)

```typescript
export class SummitCalendar {
  private container: HTMLElement;
  private summits: Summit[] = [];

  render() {
    this.container.innerHTML = `
      <div class="summit-calendar">
        <h2>Upcoming Tech Summits</h2>
        <div class="summit-list">
          ${this.summits.map(s => this.renderSummitCard(s)).join('')}
        </div>
      </div>
    `;
  }

  private renderSummitCard(summit: Summit) {
    return `
      <div class="summit-card">
        <div class="summit-date">${summit.date}</div>
        <h3>${summit.name}</h3>
        <p class="summit-location">${summit.location}</p>
        <a href="${summit.url}" target="_blank">Learn More</a>
      </div>
    `;
  }
}
```

### 3. 集成到主界面

**文件**: `src/components/Map.ts` 或 `src/main.ts`

```typescript
// 在主界面添加峰会日历面板
const summitCalendar = new SummitCalendar(document.getElementById('summit-panel'));
summitCalendar.loadSummits();
```

### 4. 峰会数据结构

**文件**: `src/types/summit.ts` (新建)

```typescript
export interface Summit {
  id: string;
  name: string;
  date: string;           // ISO 8601 格式
  location: string;       // 'Dublin, Ireland'
  url: string;            // 官网链接
  description?: string;
  topics?: string[];      // ['AI', 'Startups', 'FinTech']
  featured?: boolean;     // 是否高亮显示
}
```

## 验收标准

- [ ] 峰会日历显示 Dublin Tech Summit 最新活动
- [ ] 显示 Web Summit、Collision 等欧洲重要峰会
- [ ] 峰会按日期排序（最近的在前）
- [ ] 点击峰会卡片，跳转到官网
- [ ] 移动端正常显示（响应式布局）
- [ ] 数据每 1 小时更新一次

## UI 设计参考

```
┌─────────────────────────────────┐
│ 📅 Upcoming Tech Summits         │
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │ 15-16 May 2026            │   │
│ │ Dublin Tech Summit        │   │
│ │ 📍 RDS, Dublin            │   │
│ │ [Learn More →]            │   │
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ 3-6 Nov 2026              │   │
│ │ Web Summit                │   │
│ │ 📍 Lisbon, Portugal       │   │
│ │ [Learn More →]            │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

## 工作量估算

- 添加峰会数据源配置: 30 分钟
- 实现 SummitCalendar 组件: 2 小时
- 样式设计: 1 小时
- 集成到主界面: 30 分钟
- 测试: 1 小时

**总计**: 5 小时

## 依赖

- FR #003 (爱尔兰数据源) - 复用 RSS 聚合逻辑

## 风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 峰会网站无 RSS | 🟡 中 | 降级到 Google News 或人工维护 |
| 峰会日期解析错误 | 🟡 中 | 人工审核 + 测试 |
| 峰会数据不实时 | 🟢 低 | 每天更新即可 |

## 优先级

🟡 **P1 - 重要但非紧急** (Phase 4 - Week 4)

---

*Related: PRD Section 5.4*
