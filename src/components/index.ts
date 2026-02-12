import type { App } from 'vue'
import MarketSelector from './Global/MarketSelector.vue'
import MultiMarketStockSearch from './Global/MultiMarketStockSearch.vue'
import Logo from './Logo.vue'

// 全局组件注册
export function setupGlobalComponents(app: App) {
  // 注册多市场相关组件
  app.component('MarketSelector', MarketSelector)
  app.component('MultiMarketStockSearch', MultiMarketStockSearch)
  // 注册Logo组件
  app.component('Logo', Logo)
}

// 导出Logo组件供直接引用
export { Logo }

export default setupGlobalComponents
