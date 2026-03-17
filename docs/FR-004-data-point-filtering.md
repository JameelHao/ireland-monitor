# FR #004: 地图数据点过滤 - 优先显示爱尔兰相关新闻

## 背景

当前地图显示所有全球新闻标记点，但对于爱尔兰用户，应该优先显示爱尔兰本地和相关的新闻。

## 目标

地图上的新闻标记点优先显示：
1. 地理位置在爱尔兰的新闻
2. 内容包含爱尔兰关键词的全球新闻（如 "Irish company raises $10M"）

## 技术方案

### 1. 新增爱尔兰相关性判断函数

**文件**: `src/utils/ireland-filter.ts` (新建)

```typescript
export interface NewsItem {
  lat: number;
  lng: number;
  country?: string;
  title?: string;
  content?: string;
  source?: string;
}

export function isIrelandRelated(item: NewsItem): boolean {
  // 1. 地理位置在爱尔兰
  if (isInIreland(item.lat, item.lng)) return true;
  
  // 2. 国家字段是爱尔兰
  if (item.country === 'Ireland' || item.country === 'IE') return true;
  
  // 3. 内容包含爱尔兰关键词
  if (containsIrelandKeywords(item.title, item.content)) return true;
  
  // 4. 数据源是爱尔兰媒体
  if (isIrelandSource(item.source)) return true;
  
  return false;
}

function isInIreland(lat: number, lng: number): boolean {
  // 爱尔兰边界框（简化版）
  return lat >= 51.0 && lat <= 56.0 && lng >= -11.0 && lng <= -5.0;
}

function containsIrelandKeywords(title?: string, content?: string): boolean {
  const text = `${title} ${content}`.toLowerCase();
  const keywords = [
    'ireland', 'irish', 'dublin', 'cork', 'galway', 'limerick',
    'tcd', 'ucd', 'dcu', 'ucc', 'nuig', 'ul',
    'sfi', 'enterprise ireland', 'ipa', 'ida',
  ];
  return keywords.some(kw => text.includes(kw));
}

function isIrelandSource(source?: string): boolean {
  const ieSources = ['Silicon Republic', 'Tech Central', 'TCD News', 'UCD News'];
  return ieSources.some(s => source?.includes(s));
}
```

### 2. 修改地图标记渲染逻辑

**文件**: `src/components/GlobeMap.ts` (第 1930 行 `flushMarkers()`)

```typescript
private flushMarkers(): void {
  if (!this.globe || !this.initialized || this.destroyed || this.webglLost) return;
  this.wakeGlobe();

  let markers: GlobeMarker[] = [];
  if (this.layers.hotspots) markers.push(...this.hotspotMarkers);
  if (this.layers.bases) markers.push(...this.baseMarkers);
  if (this.layers.webcams) markers.push(...this.webcamMarkers);
  markers.push(...this.newsLocationMarkers);
  markers.push(...this.flashMarkers);

  // 🆕 过滤：优先显示爱尔兰相关标记
  const irelandMarkers = markers.filter(m => {
    // 如果是爱尔兰本地标记，始终显示
    if (isIrelandRelated({
      lat: m._lat,
      lng: m._lng,
      country: (m as any).country,
      title: (m as any).title,
      content: (m as any).content,
      source: (m as any).source,
    })) {
      return true;
    }
    
    // 其他全球新闻也显示，但优先级低（可选：限制数量）
    return true;  // 或者改成 false 只显示爱尔兰相关
  });

  try {
    this.globe.htmlElementsData(irelandMarkers);
  } catch (err) { if (import.meta.env.DEV) console.warn('[GlobeMap] flush error', err); }
}
```

### 3. 添加爱尔兰高亮样式（可选）

**文件**: `src/styles/map-markers.css`

```css
/* 爱尔兰相关新闻标记使用绿色 */
.marker-ireland {
  background-color: #169B62;
  border: 2px solid #0F7A4C;
}

/* 全球新闻标记使用灰色 */
.marker-global {
  background-color: #6B7280;
  border: 2px solid #4B5563;
}
```

## 验收标准

- [ ] 地图上的新闻标记点优先显示爱尔兰相关内容
- [ ] 点击标记，弹出的新闻卡片显示正确内容
- [ ] 爱尔兰相关标记使用绿色（与品牌一致）
- [ ] 非爱尔兰新闻标记使用灰色（或不显示）
- [ ] 性能：过滤逻辑不影响地图渲染（帧率 > 30fps）

## 工作量估算

- 实现 `isIrelandRelated()`: 1 小时
- 修改 `flushMarkers()`: 30 分钟
- 添加高亮样式: 30 分钟
- 测试数据点过滤: 1 小时
- 性能优化: 1 小时

**总计**: 4 小时

## 依赖

- FR #003 (爱尔兰数据源) - 需要先有爱尔兰新闻数据

## 风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 关键词误判 | 🟡 中 | 增加白名单/黑名单 |
| 过滤逻辑太严格 | 🟡 中 | 提供"显示全球"开关 |
| 性能影响 | 🟢 低 | 过滤逻辑简单，影响小 |

## 优先级

🔴 **P0 - 必须完成** (Phase 3 - Week 3)

---

*Related: PRD Section 5.3*
