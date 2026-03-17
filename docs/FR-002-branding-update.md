# FR #002: 品牌更新 - World Monitor → IrishTech Daily

## 背景

产品从"全球情报面板"转型为"爱尔兰科技圈情报平台"，需要更新品牌名称、颜色、Slogan。

## 目标

所有用户可见的界面元素都显示 "IrishTech Daily" 品牌，使用爱尔兰绿色作为主色调。

## 技术方案

### 1. 更新产品名称

**文件**: `src/config/site.ts` (或类似配置文件)

```typescript
export const SITE_CONFIG = {
  name: 'IrishTech Daily',
  tagline: "Ireland's tech pulse, daily",
  description: '爱尔兰科技圈的每日简报',
};
```

### 2. 修改主色调为爱尔兰绿

**文件**: `src/styles/variables.css` (或 Tailwind 配置)

```css
:root {
  --primary-color: #169B62;      /* 爱尔兰绿 */
  --primary-hover: #0F7A4C;
  --primary-light: #48C78E;
  --accent-color: #FF9500;        /* 橙色（辅助色）*/
}
```

### 3. 更新 Logo

**文件**: `public/logo.svg` (或图标路径)

- 设计爱尔兰地图轮廓 logo（如果有设计资源）
- 或者临时使用文字 logo "IE"

### 4. 更新 HTML meta 标签

**文件**: `index.html`

```html
<title>IrishTech Daily - Ireland's Tech Pulse</title>
<meta name="description" content="Real-time tech news and insights for Ireland's startup ecosystem">
<meta property="og:title" content="IrishTech Daily">
```

### 5. 更新 README

**文件**: `README.md`

- 改标题为 "IrishTech Daily"
- 更新描述为爱尔兰科技情报平台
- 更新 screenshot（如果有）

## 验收标准

- [ ] 网站标题显示 "IrishTech Daily"
- [ ] 导航栏/Header 显示新名称
- [ ] 主色调为爱尔兰绿（#169B62）
- [ ] HTML meta 标签已更新
- [ ] README.md 已更新
- [ ] 浏览器 tab 显示正确的 favicon + 标题

## 工作量估算

- 配置文件修改: 30 分钟
- CSS 颜色变量修改: 1 小时
- Logo 更新: 1 小时（如果需要设计）
- 文档更新: 30 分钟
- 测试: 30 分钟

**总计**: 3.5 小时

## 依赖

无

## 风险

🟢 低风险 - 纯视觉更新，不影响功能

## 优先级

🔴 **P0 - 必须完成** (Phase 1 - Week 1)

---

*Related: PRD Section 4.1*
