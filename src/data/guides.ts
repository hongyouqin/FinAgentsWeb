/**
 * guides.ts - 学习指南 / SEO 落地页文章元数据
 *
 * 作用：
 *   维护所有 /guide/:slug 文章的元数据和内容索引。
 *   预渲染脚本和 sitemap 都从这里取 slug 列表，保证三处数据一致。
 *
 * 新增文章步骤：
 *   1. 在 src/content/guides/ 下新建 <slug>.md
 *   2. 在本文件 GUIDES 数组追加一条元数据
 *   3. 执行 `yarn build:ssg` 即可自动预渲染新文章页
 *
 * 内容原则（SEO 导向）：
 *   - 标题含核心关键词 + 吸引点击元素（数字、实测、教程）
 *   - 描述 80-160 字，首句精准回答用户搜索意图
 *   - 关键词 5-10 个，逗号分隔，长尾优先
 *   - 正文 1500 字起步，含 H2/H3 层级、FAQ、配图、代码块
 */

// 利用 Vite 的 ?raw 把 markdown 原文作为字符串导入（构建时内联，无需额外 loader）
import deepseekStock from '@/content/guides/deepseek-stock-analysis.md?raw'
import qwenStock from '@/content/guides/qwen-stock-analysis.md?raw'
import multiAgentStock from '@/content/guides/multi-agent-stock.md?raw'
import aiToolCompare2026 from '@/content/guides/ai-stock-tool-compare-2026.md?raw'
import deepseekVsQwen from '@/content/guides/deepseek-vs-qwen-stock.md?raw'
import maotaiAiAnalysis from '@/content/guides/maotai-ai-analysis.md?raw'
import aiStockWorthIt from '@/content/guides/ai-stock-worth-it.md?raw'
import tetIndicatorStrategy from '@/content/guides/tet-indicator-strategy.md?raw'

export interface GuideMeta {
  /** URL slug，对应路由 /guide/<slug> */
  slug: string
  /** 文章标题（SEO title 的核心，不含品牌后缀） */
  title: string
  /** 文章副标题（可选，列表页和详情页显示） */
  subtitle?: string
  /** SEO 描述，80-160 字 */
  description: string
  /** SEO 关键词，逗号分隔 */
  keywords: string
  /** 封面图，绝对路径或 /assets 开头 */
  cover: string
  /** 分类：教程 tutorial / 案例 case / 对比 compare / 指南 guide */
  category: 'tutorial' | 'case' | 'compare' | 'guide'
  /** 标签，用于聚合 */
  tags: string[]
  /** 作者 */
  author: string
  /** 发布时间 ISO 8601 */
  publishedAt: string
  /** 更新时间 ISO 8601 */
  updatedAt: string
  /** 预计阅读分钟数 */
  readTime: number
  /** 是否精选（列表页置顶） */
  featured?: boolean
  /** Markdown 正文原文（构建期内联） */
  content: string
}

/**
 * 分类中文名称
 */
export const CATEGORY_LABELS: Record<GuideMeta['category'], string> = {
  tutorial: '教程',
  case: '案例',
  compare: '对比',
  guide: '指南',
}

/**
 * 所有文章（新文章在数组末尾追加，旧文章不要改 slug）
 */
export const GUIDES: GuideMeta[] = [
  {
    slug: 'deepseek-stock-analysis',
    title: 'DeepSeek 能炒股吗？一个月实测 A 股 10 支龙头股全记录',
    subtitle: '用国产大模型做基本面分析的完整实战',
    description:
      'DeepSeek V3 能预测股票吗？本文用 TradingAgents 多智能体框架接入 DeepSeek，实测贵州茅台、宁德时代等 10 支 A 股龙头，一个月跟踪准确率、信号质量与实盘对比数据。',
    keywords: 'DeepSeek 炒股,DeepSeek 股票分析,DeepSeek A股,国产大模型 炒股,AI 股票分析,多智能体 股票',
    cover: '/assets/schema.png',
    category: 'case',
    tags: ['DeepSeek', 'A股', '实测', '多智能体'],
    author: 'TradingAgents 中文版团队',
    publishedAt: '2026-05-03T10:00:00+08:00',
    updatedAt: '2026-05-03T10:00:00+08:00',
    readTime: 12,
    featured: true,
    content: deepseekStock,
  },
  {
    slug: 'qwen-stock-analysis',
    title: '通义千问炒股实录：3 种方法用 Qwen 做基本面分析（附 Prompt）',
    subtitle: '阿里千问大模型在 A 股投研场景的应用指南',
    description:
      '阿里通义千问（Qwen）在股票分析上能做什么？本文给出 3 套可复用的 Prompt 模板，配合 TradingAgents 框架，手把手演示如何用千问模型完成财报解读、估值比较与事件驱动分析。',
    keywords: '通义千问 炒股,千问 股票,Qwen 股票分析,阿里大模型 炒股,AI 投研,大模型 Prompt',
    cover: '/assets/researcher.png',
    category: 'tutorial',
    tags: ['千问', 'Qwen', 'Prompt', '基本面'],
    author: 'TradingAgents 中文版团队',
    publishedAt: '2026-05-03T10:00:00+08:00',
    updatedAt: '2026-05-03T10:00:00+08:00',
    readTime: 10,
    featured: true,
    content: qwenStock,
  },
  {
    slug: 'multi-agent-stock',
    title: '多智能体 AI 如何分析一支股票？TradingAgents 架构完全解析',
    subtitle: '从分析师到风控，7 个 AI 角色如何协作做出投资决策',
    description:
      '多智能体（Multi-Agent）AI 系统怎么做股票分析？本文以 TradingAgents-CN 为例，拆解分析师、研究员、交易员、风控 4 类 7 个 AI 角色的协作流程、辩论机制和最终决策输出。',
    keywords: '多智能体 股票分析,TradingAgents 架构,多智能体 AI,AI 交易框架,LangChain 股票,多 Agent 投资',
    cover: '/assets/analyst.png',
    category: 'guide',
    tags: ['多智能体', 'TradingAgents', '架构', 'LangChain'],
    author: 'TradingAgents 中文版团队',
    publishedAt: '2026-05-03T10:00:00+08:00',
    updatedAt: '2026-05-03T10:00:00+08:00',
    readTime: 15,
    featured: true,
    content: multiAgentStock,
  },
  {
    slug: 'ai-stock-tool-compare-2026',
    title: 'AI 股票分析工具盘点 2026：6 款国产 AI 选股平台横评',
    subtitle: '国内主流 AI 炒股工具优劣对比',
    description:
      '2026 年国内 AI 股票分析工具横评：TradingAgents 中文版、DeepSeek、通义千问、豆包、同花顺 i 问财、东方财富 AI，从模型能力、数据覆盖、研报深度、免费额度、合规性六维打分，帮你选出最适合的 AI 选股助手。',
    keywords: 'AI 股票分析 工具,AI 选股 免费,国产 AI 炒股,AI 股票分析平台,AI 股票 app,DeepSeek 炒股 工具',
    cover: '/assets/schema.png',
    category: 'compare',
    tags: ['工具对比', '免费AI', 'A股', '横评'],
    author: 'TradingAgents 中文版团队',
    publishedAt: '2026-05-03T12:00:00+08:00',
    updatedAt: '2026-05-03T12:00:00+08:00',
    readTime: 10,
    featured: true,
    content: aiToolCompare2026,
  },
  {
    slug: 'deepseek-vs-qwen-stock',
    title: 'DeepSeek vs 通义千问：谁更懂 A 股？5 支个股实测 PK',
    subtitle: '国产两大 LLM 在股票分析场景的正面较量',
    description:
      'DeepSeek V4 对比通义千问 Qwen-Plus：用贵州茅台、宁德时代、比亚迪、中芯国际、隆基绿能 5 支个股做统一 Prompt 实测，从基本面理解、财报解读、风险识别、推理可信度、输出结构五个维度打分，得出国产大模型 A 股分析能力结论。',
    keywords: 'DeepSeek 千问 对比,DeepSeek vs Qwen,国产大模型 股票,A股 AI 实测,DeepSeek 千问 炒股,国产大模型 对比',
    cover: '/assets/researcher.png',
    category: 'compare',
    tags: ['DeepSeek', '千问', '对比', '实测'],
    author: 'TradingAgents 中文版团队',
    publishedAt: '2026-05-03T12:00:00+08:00',
    updatedAt: '2026-05-03T12:00:00+08:00',
    readTime: 11,
    featured: false,
    content: deepseekVsQwen,
  },
  {
    slug: 'maotai-ai-analysis',
    title: '用 AI 分析贵州茅台：完整 Prompt + 研报模板（可直接复用）',
    subtitle: '以 600519 为例的 AI 研报实战步骤',
    description:
      '手把手演示如何用 DeepSeek / 千问生成贵州茅台（600519）基本面研报：3 段可复用 Prompt + 9 小节研报模板，换个股票代码就能复用。含数据上下文注入、结构化 Prompt、多空辩证的完整流程示例。',
    keywords: '贵州茅台 AI 分析,茅台 AI 研报,600519 AI,AI 分析白酒股,茅台 基本面 AI,AI 研报 Prompt 模板',
    cover: '/assets/trader.png',
    category: 'tutorial',
    tags: ['贵州茅台', '白酒股', 'Prompt', '实战'],
    author: 'TradingAgents 中文版团队',
    publishedAt: '2026-05-03T12:00:00+08:00',
    updatedAt: '2026-05-03T12:00:00+08:00',
    readTime: 13,
    featured: false,
    content: maotaiAiAnalysis,
  },
  {
    slug: 'ai-stock-worth-it',
    title: 'AI 炒股真的靠谱吗？3 个月回测 30 支 A 股实盘对比',
    subtitle: '把 AI 研报当策略信号，能跑赢指数吗？',
    description:
      'AI 炒股到底靠不靠谱？我们用 TradingAgents 中文版对 30 支不同风格 A 股生成研报，按看多/看空信号分组持有 60 天，对比沪深 300。公开全部数据与方法论：看多组 +8.2% 跑赢基准 5.1%，多空信号差距 11.8%。',
    keywords: 'AI 炒股 靠谱吗,AI 股票 回测,AI 选股 准确率,AI 投资 效果,AI 股票分析 有用吗,AI 炒股 实测',
    cover: '/assets/risk.png',
    category: 'case',
    tags: ['回测', '实测', '数据', '准确率'],
    author: 'TradingAgents 中文版团队',
    publishedAt: '2026-05-03T12:00:00+08:00',
    updatedAt: '2026-05-03T12:00:00+08:00',
    readTime: 12,
    featured: true,
    content: aiStockWorthIt,
  },
  {
    slug: 'tet-indicator-strategy',
    title: 'TET 三维量化指标：锚定趋势 + 情绪指数 + 择时信号，A 股择时策略完整拆解',
    subtitle: 'Trend · Emotion · Timing 三件套 + 联合趋势 JTS，一套不被情绪绑架的择时框架',
    description:
      'TET 三维量化指标详解：锚定趋势 ATS 去噪拟合真实趋势、情绪指数 EI 独立衡量超买超卖、择时信号 TI = ATS − EI 合成入场分、联合趋势 JTS 纳入沪深 300 大盘联动。含公式、阈值、决策树、与 MACD/RSI 对比、FAQ，覆盖从原理到使用的完整链路。',
    keywords: 'TET 指标,锚定趋势,情绪指数,择时信号,A股 量化策略,A股 择时,量化指标,趋势情绪分离,联合趋势,沪深300 基准',
    cover: '/assets/schema.png',
    category: 'guide',
    tags: ['量化策略', '择时', 'A股', 'TET'],
    author: 'TradingAgents 中文版团队',
    publishedAt: '2026-05-06T12:00:00+08:00',
    updatedAt: '2026-05-06T12:00:00+08:00',
    readTime: 14,
    featured: true,
    content: tetIndicatorStrategy,
  },
]

/**
 * 根据 slug 获取文章元数据
 */
export function getGuideBySlug(slug: string): GuideMeta | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

/**
 * 获取相关文章（同分类优先 + 标签交集）
 */
export function getRelatedGuides(slug: string, limit = 3): GuideMeta[] {
  const current = getGuideBySlug(slug)
  if (!current) return []
  return GUIDES.filter((g) => g.slug !== slug)
    .sort((a, b) => {
      const aScore =
        (a.category === current.category ? 2 : 0) +
        a.tags.filter((t) => current.tags.includes(t)).length
      const bScore =
        (b.category === current.category ? 2 : 0) +
        b.tags.filter((t) => current.tags.includes(t)).length
      return bScore - aScore
    })
    .slice(0, limit)
}

/**
 * 导出所有文章 slug（供预渲染脚本 / sitemap 使用）
 * 通过 .mjs 构建期读取本 TS 不方便，所以在 scripts/prerender.mjs 里独立维护一份。
 * 两边都从 GUIDES 数组同步，改动记得两处对齐。
 */
export const GUIDE_SLUGS = GUIDES.map((g) => g.slug)
