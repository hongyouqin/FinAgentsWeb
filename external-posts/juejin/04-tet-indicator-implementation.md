# Vue3 + ECharts 实战：如何把一个三维量化指标做成"双图联动"的可视化页面

> 发布平台：掘金 · 目标专栏：前端 / 可视化 / 金融科技
> 目标锚文本：`TET 指标` → `https://nbstockai.com/guide/tet-indicator-strategy`
> Tag：#Vue3 #ECharts #数据可视化 #金融 #量化
> 预计字数：2600 字 · 配图建议：联动效果录屏 × 1、指标决策树 × 1、代码片段

---

## 前言

最近给一个 A 股量化策略平台做了一个"指标可视化"页面，核心诉求只有一句话：

> **用户输入一个股票代码，页面给出一个"不被情绪带偏的择时结论" + 两张可交互联动的走势图**。

指标本身叫 **TET**（Trend · Emotion · Timing）——一套把"趋势"和"情绪"显式拆开算的三维量化指标体系，原理部分我写在了 [TET 指标完整拆解](https://nbstockai.com/guide/tet-indicator-strategy)。本文只讲**前端工程**这一面：

- 怎么把 4 个指标做成一组兼具信息密度和视觉美感的"实时快照卡"
- 怎么让 **TET 指标走势图** 和 **收盘价走势图** 做到鼠标/触摸的双向联动
- 怎么在移动端把 tooltip 和图例的挤占体验调顺

技术栈：**Vue 3 + TypeScript + Element Plus + ECharts 5**。

---

## 一、页面拆成 5 个区块

```
┌─────────────────────────────────────┐
│  查询条（股票代码输入 + 计算按钮）       │
├─────────────────────────────────────┤
│  实时快照（4 张指标卡 + 徽章）         │
│  ┌──────┬──────┬──────┬──────┐       │
│  │ ATS  │  EI  │  TI  │ JTS  │       │
│  └──────┴──────┴──────┴──────┘       │
├─────────────────────────────────────┤
│  摘要条（代码 / 基准 / 日期 / 数据量） │
├─────────────────────────────────────┤
│  时间范围切换（1m / 3m / 6m / 1y / 2y）│
├─────────────────────────────────────┤
│  TET 指标走势图  ↕ 双图联动            │
│  收盘价走势图                          │
└─────────────────────────────────────┘
```

4 张指标卡用一个 `metric-grid` CSS Grid 布局，在 > 1100px 显示四列、480–1100px 显示两列、< 480px 显示单列。这是个很常规的响应式，没什么可说的。**关键难点在最后两张图的联动**。

## 二、双图联动：别手写事件监听

### 2.1 一个踩过的坑

我一开始写的是这样：

```ts
tetChart.on('highlight', (params) => {
  priceChart.dispatchAction({
    type: 'showTip',
    seriesIndex: 0,
    dataIndex: params.batch[0].dataIndex,
  })
})
```

跑起来没问题，但移动端触摸时 tooltip 会"跳来跳去"，而且两个图的 `axisPointer` 不同步——Y 轴的十字准星在 TET 图上显示、在 price 图上不显示。

翻了半天 ECharts 文档，才发现**原生支持跨实例联动**：

### 2.2 `group` + `echarts.connect()`

```ts
import * as echarts from 'echarts'

const CHART_GROUP_ID = 'tet-calc-sync'

// 初始化两个图
tetChart = echarts.init(tetChartRef.value)
priceChart = echarts.init(priceChartRef.value)

// 分别 setOption 之后
tetChart.setOption(tetOption)
priceChart.setOption(priceOption)

// 加入同一个分组，然后 connect
tetChart.group = CHART_GROUP_ID
priceChart.group = CHART_GROUP_ID
echarts.connect(CHART_GROUP_ID)
```

效果：**鼠标或触摸在任一图上移动，另一张图会同步显示同一个 X 轴位置的 tooltip 和十字准星**。这不仅省掉了手写事件监听，连 `axisPointer` 都是真正同步的。

### 2.3 移动端兼容的两个关键配置

只做 `connect` 还不够，移动端还得加两项 tooltip 配置：

```ts
tooltip: {
  trigger: 'axis',
  axisPointer: { type: 'line' },
  confine: true,                    // ① 把 tooltip 限制在图表容器内，不溢出
  triggerOn: 'mousemove|click'      // ② 让触摸点击也能触发 tooltip
}
```

- **`confine: true`**：没这个设置，小屏下 tooltip 会溢出屏幕右边；加了之后会自动贴边，不会越界。
- **`triggerOn: 'mousemove|click'`**：默认只响应 `mousemove`，移动端触摸事件不会触发 tooltip；加上 `click` 之后，**用户手指点一下图表任意位置，两个图都会同步高亮那一天的数据**。

## 三、跨断点重建 vs 普通 resize

响应式图表有一个微妙的坑：**ECharts 的 `option` 里很多样式和断点相关**（字体大小、legend 位置、grid 边距）。如果只做 `chart.resize()`，这些样式不会变；必须重新 `setOption`。

但每次 resize 都 `setOption` 又太重——数据更新会闪烁。我的做法是**只在跨越移动端断点时重建**：

```ts
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let lastWidth = 0

function handleResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    const w = tetChartRef.value?.clientWidth || 0
    // 跨越 600px 边界时重建；其他情况只 resize
    const cross = (lastWidth < 600) !== (w < 600)
    lastWidth = w
    if (cross && chartData.value.length > 0) {
      renderCharts()              // 重建 option
    } else {
      tetChart?.resize()          // 只 resize
      priceChart?.resize()
    }
  }, 150)                         // 防抖 150ms
}
```

150ms 的防抖足够让用户拖拽窗口流畅（人眼不会察觉），又能避免连续触发 `setOption`。

## 四、把 TET 的"四个指标卡"做得有信息量又不挤

这是个纯 CSS + Vue computed 的活，但有几个细节值得说。

### 4.1 4 个指标用 4 种主题色

```ts
const anchoredClass = computed(() => {          // ATS
  const v = lastItem.value?.anchored_trend_score ?? 0
  if (v > 0.5) return 'strong-pos'
  if (v > 0) return 'pos'
  if (v < -0.5) return 'strong-neg'
  if (v < 0) return 'neg'
  return 'neutral'
})
```

然后 CSS 里把 `strong-pos / pos / neutral / neg / strong-neg` 五档颜色定死：

```scss
.metric-value {
  &.strong-pos { color: #059669; }   // 深绿 = 强势
  &.pos        { color: #16a34a; }   // 常绿
  &.neutral    { color: #475569; }   // 石板
  &.neg        { color: #ea580c; }   // 橙
  &.strong-neg { color: #dc2626; }   // 红 = 深度下行
}
```

注意：**EI（情绪指数）的色映射是反的**——EI 越负（情绪越低迷、越适合贪婪入场）反而用绿色、EI 越正（越亢奋）用红色：

```ts
const emotionClass = computed(() => {
  const v = lastItem.value?.emotion_index ?? 0
  if (v <= -0.3) return 'strong-pos'   // 情绪低 = 机会 = 绿
  if (v >= 0.3)  return 'strong-neg'   // 情绪高 = 风险 = 红
  return 'neutral'
})
```

这个"反直觉"的色映射，是对"别人恐惧我贪婪"这个业务语义的可视化翻译——**色彩不跟数值走，跟业务含义走**。

### 4.2 每张卡一个气泡 tooltip 解释指标含义

```html
<div class="metric-head">
  <div class="metric-icon">…</div>
  <div class="metric-meta">
    <span class="metric-label-cn">联合趋势</span>
    <span class="metric-label-en">JOINT TREND SCORE</span>
  </div>
  <el-tooltip
    content="同趋势（个股与大盘同涨同跌）按两者里更弱的一方打分；方向相反直接判 0。分数越接近 +1，代表个股顺着大盘涨势且强于大盘，是最理想的标的"
    placement="top"
  >
    <el-icon class="metric-help"><QuestionFilled /></el-icon>
  </el-tooltip>
</div>
```

`el-tooltip` 放在卡片头部的问号图标上，移动端长按也能触发，比硬写一段解释文字要省空间得多。**专业的指标页面不是"给你一个数就完了"，而是"给你一个数 + 随时可查的定义"**。

## 五、一个小的 UX 彩蛋：左上角 "LATEST" 徽章的脉冲动画

```scss
.latest-badge::before {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
  animation: pulse-dot 1.8s infinite;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45); }
  70%      { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}
```

在"实时快照"徽章右上角加一颗脉冲小点——视觉上暗示"这是实时数据"，心理上让用户觉得这个页面是活的。**一个 CSS 关键帧，30 行代码，一分钟见效**。

## 六、几个可以抄的小结

1. **ECharts 跨实例联动用 `group` + `echarts.connect()`**，别手写 `dispatchAction`——后者在移动端并发触发时会抖。
2. **移动端 tooltip 必加 `confine: true` + `triggerOn: 'mousemove|click'`**，一个防溢出、一个让触摸能触发。
3. **响应式图表的 resize 策略**：跨断点重建 option、断点内只 `resize()` + 150ms 防抖，既流畅又不闪。
4. **指标卡的色彩映射跟"业务语义"而不是"数值符号"走**。情绪低 / 超卖 = 绿，情绪高 / 亢奋 = 红。
5. **给每张指标卡配一个 `el-tooltip`**，提升专业感的同时省下大段解释文字的空间。

完整的指标定义、阈值与决策树逻辑，我写在这篇 [TET 指标完整拆解](https://nbstockai.com/guide/tet-indicator-strategy) 里了。另外如果你对背后的 Python 量化数据管线感兴趣，可以看下 [多智能体 AI 如何分析一支股票](https://nbstockai.com/guide/multi-agent-stock)。

---

> 📝 本文为前端工程实现笔记，涉及的数值为策略教学用途，不构成投资建议。
