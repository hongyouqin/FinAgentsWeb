import weixin from './weixin'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $wx: typeof weixin
  }
}
