# FR #001: 地图本地化 - 聚焦爱尔兰视角

## 背景

IrishTech Daily 的核心差异化是"爱尔兰本地化"，地图是最直观的视觉信号。当前 worldmonitor 默认显示全球视角，需要改为聚焦爱尔兰。

## 目标

用户打开网站，看到的是聚焦都柏林的 3D 地球，而不是全球视角。

## 技术方案

### 1. 修改默认视角

**文件**: `src/components/GlobeMap.ts` (第 2437 行)

```typescript
// 修改 VIEW_POVS 配置
private static readonly VIEW_POVS: Record<MapView, { lat: number; lng: number; altitude: number }> = {
  ireland:  { lat: 53.35, lng: -6.26, altitude: 0.25 },  // 爱尔兰全景
  dublin:   { lat: 53.35, lng: -6.26, altitude: 0.15 },  // 都柏林
  cork:     { lat: 51.90, lng: -8.47, altitude: 0.15 },  // 科克
  galway:   { lat: 53.27, lng: -9.05, altitude: 0.15 },  // 戈尔韦
  global:   { lat: 53.35, lng: -6.26, altitude: 0.3 },   // 默认改成爱尔兰
};
```

### 2. 修改视图类型定义

**文件**: `src/components/MapContainer.ts` (第 49 行)

```typescript
// 只保留爱尔兰相关视图
export type MapView = 'ireland' | 'dublin' | 'cork' | 'galway';
```

### 3. 更新 UI 视图切换按钮

**文件**: 查找所有引用 `MapView` 的组件，去掉 `america`, `asia`, `africa` 等选项。

## 验收标准

- [ ] 打开网站，地球默认聚焦都柏林（lat: 53.35, lng: -6.26）
- [ ] 视图切换按钮只显示：Ireland | Dublin | Cork | Galway
- [ ] 点击每个视图，地球正确移动到对应城市
- [ ] 移动端正常显示（无布局错乱）

## 工作量估算

- 修改视角配置: 10 分钟
- 修改 MapView 类型: 10 分钟
- 更新 UI 组件: 30 分钟
- 测试: 30 分钟

**总计**: 1.5 小时

## 依赖

无

## 风险

🟢 低风险 - 纯配置修改，不涉及复杂逻辑

## 优先级

🔴 **P0 - 必须完成** (Phase 1 - Week 1)

---

*Related: PRD Section 5.1*
