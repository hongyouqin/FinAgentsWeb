import wx from 'weixin-js-sdk'

interface WxConfig {
  debug?: boolean
  appId: string
  timestamp: string
  nonceStr: string
  signature: string
  jsApiList: string[]
}

interface WxPayParams {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

class WeixinSDK {
  private wx: any

  constructor() {
    this.wx = wx
  }

  config(config: WxConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wx.config({
        debug: config.debug || false,
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: config.jsApiList
      })

      this.wx.ready(() => {
        resolve()
      })

      this.wx.error((res: any) => {
        reject(res)
      })
    })
  }

  chooseWXPay(params: WxPayParams): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wx.chooseWXPay({
        ...params,
        success: (res: any) => {
          resolve(res)
        },
        fail: (err: any) => {
          reject(err)
        },
        cancel: () => {
          reject({ errMsg: 'chooseWXPay:cancel' })
        }
      })
    })
  }

  isWechatEnv(): boolean {
    const ua = navigator.userAgent.toLowerCase()
    return ua.includes('micromessenger')
  }

  getWechatCode(appId: string, redirectUri: string, state: string = 'STATE') {
    const encodedRedirectUri = encodeURIComponent(redirectUri)
    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`
    window.location.href = url
  }
}

const weixin = new WeixinSDK()
export default weixin
