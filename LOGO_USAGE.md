# Logo 组件使用文档

## 组件路径
`@/components/Logo.vue`

## 功能说明
FinAgents Logo 组件，支持自定义尺寸、显示文字和徽章。

## Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `number \| string` | `32` | Logo 尺寸，可以是数字(px)或字符串(如'2rem') |
| `showText` | `boolean` | `false` | 是否显示 "FinAgents" 文字 |
| `showBadge` | `boolean` | `false` | 是否显示 "AI" 徽章 |

## 使用方式

### 方式一：全局组件（推荐）
已全局注册，可直接使用：

```vue
<template>
  <!-- 仅 Logo 图标 -->
  <Logo />

  <!-- 大尺寸 Logo -->
  <Logo :size="64" />

  <!-- Logo + 文字 -->
  <Logo :size="40" show-text />

  <!-- Logo + 文字 + 徽章（完整版）-->
  <Logo :size="40" show-text show-badge />
</template>
```

### 方式二：按需导入
```vue
<script setup lang="ts">
import { Logo } from '@/components'
</script>

<template>
  <Logo :size="48" show-text />
</template>
```

### 方式三：直接导入
```vue
<script setup lang="ts">
import Logo from '@/components/Logo.vue'
</script>

<template>
  <Logo :size="32" />
</template>
```

## 使用场景示例

### 1. 导航栏
```vue
<nav>
  <Logo :size="40" show-text show-badge />
</nav>
```

### 2. 页面标题
```vue
<div class="page-header">
  <Logo :size="48" show-text />
</div>
```

### 3. 登录页
```vue
<div class="login-container">
  <Logo :size="80" show-text show-badge />
</div>
```

### 4. 侧边栏
```vue
<aside>
  <!-- 展开时 -->
  <Logo :size="32" show-text />
  
  <!-- 收起时 -->
  <Logo :size="24" />
</aside>
```

### 5. 移动端
```vue
<header>
  <Logo :size="28" />
</header>
```

## 设计特点

- ✅ **六边形边框**：象征 AI 科技感
- ✅ **上升折线**：金融图表，代表增长
- ✅ **青蓝渐变**：统一配色体系
- ✅ **SVG 矢量**：任意缩放不失真
- ✅ **发光效果**：Hover 增强视觉反馈

## 注意事项

1. **渐变 ID 冲突**：如果同一页面有多个 Logo，渐变定义可能冲突。当前实现已使用唯一 ID。
2. **尺寸建议**：
   - 最小：24px（移动端）
   - 标准：32-40px（导航栏）
   - 大型：48-80px（页面标题、登录页）
3. **性能**：纯 SVG，性能优秀，可放心使用

## 技术实现

- Vue 3 Composition API
- TypeScript 类型支持
- SCSS 样式
- 响应式尺寸
- 发光效果动画
