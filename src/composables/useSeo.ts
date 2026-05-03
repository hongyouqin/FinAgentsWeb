/**
 * useSeo - 统一的页面 SEO 组合式函数
 *
 * 目的：为每个公开路由输出差异化的 title / description / canonical / og / twitter 元信息，
 *       提升百度等搜索引擎的收录率和长尾关键词命中率。
 *
 * 依赖：@unhead/vue（需在 main.ts 通过 createHead() 注入）
 *
 * 用法：
 *   import { useSeo } from '@/composables/useSeo'
 *   useSeo({
 *     title: 'AI 股票分析教程 - TradingAgents 中文版',
 *     description: '……',
 *     keywords: 'AI股票分析,……',
 *     path: '/guide/ai-stock-analysis',        // 可选，默认取 window.location.pathname
 *     image: '/assets/schema.png'               // 可选 OG 图
 *   })
 *
 * 注意：
 * - title 会自动拼 " - TradingAgents 中文版" 后缀，如果已包含品牌词则保留原样
 * - description 百度推荐 80-160 字，过长会被截断
 * - 所有页面共用同一组"品牌站点"信息（见 SITE_DEFAULTS）
 */

import { useHead } from '@unhead/vue'

/** 站点级默认配置（与 index.html / sitemap 保持一致） */
const SITE_DEFAULTS = {
  siteName: 'TradingAgents 中文版',
  siteUrl: 'https://nbstockai.com',
  brandSuffix: ' - TradingAgents 中文版',
  defaultImage: 'https://nbstockai.com/assets/schema.png',
  twitterCard: 'summary_large_image' as const,
  locale: 'zh_CN',
} as const

export interface SeoConfig {
  /** 页面标题（不要手动拼品牌后缀，会自动补） */
  title: string
  /** 页面描述（80-160 中文字符，面向搜索结果片段） */
  description: string
  /** 页面关键词（逗号分隔，5-10 个） */
  keywords?: string
  /** 页面路径（不含域名），默认取当前路由 */
  path?: string
  /** OG 图绝对 URL 或站内路径，默认首页 schema.png */
  image?: string
  /** 是否阻止收录（预览/测试页可以传 true） */
  noindex?: boolean
  /** 额外 meta（透传给 useHead） */
  extraMeta?: Array<{ name?: string; property?: string; content: string }>
}

/**
 * 设置页面 SEO 元信息。
 * 在 Vue setup 中直接调用即可。
 */
export function useSeo(cfg: SeoConfig) {
  const path = cfg.path ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  const canonical = SITE_DEFAULTS.siteUrl + (path.startsWith('/') ? path : '/' + path)

  // 标题自动补品牌后缀
  const title = cfg.title.includes('TradingAgents') || cfg.title.includes(SITE_DEFAULTS.siteName)
    ? cfg.title
    : cfg.title + SITE_DEFAULTS.brandSuffix

  // OG 图：允许传站内路径
  const ogImage = cfg.image
    ? (cfg.image.startsWith('http') ? cfg.image : SITE_DEFAULTS.siteUrl + cfg.image)
    : SITE_DEFAULTS.defaultImage

  const meta: Array<{ name?: string; property?: string; content: string }> = [
    { name: 'description', content: cfg.description },
    { name: 'robots', content: cfg.noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large' },

    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_DEFAULTS.siteName },
    { property: 'og:title', content: title },
    { property: 'og:description', content: cfg.description },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: ogImage },
    { property: 'og:locale', content: SITE_DEFAULTS.locale },

    // Twitter Card
    { name: 'twitter:card', content: SITE_DEFAULTS.twitterCard },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: cfg.description },
    { name: 'twitter:image', content: ogImage },
  ]

  if (cfg.keywords) {
    meta.push({ name: 'keywords', content: cfg.keywords })
  }

  if (cfg.extraMeta?.length) {
    meta.push(...cfg.extraMeta)
  }

  useHead({
    title,
    meta,
    link: [
      { rel: 'canonical', href: canonical },
      { rel: 'alternate', hreflang: 'zh-CN', href: canonical },
    ],
  })
}

export default useSeo
