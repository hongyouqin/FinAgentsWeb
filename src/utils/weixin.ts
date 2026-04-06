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
        jsApiList: config.jsApiList || ['chooseWXPay', 'saveImageToPhotosAlbum']
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
    console.log('chooseWXPay', params);
    
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

  getWechatCodeForUser(appId: string, redirectUri: string, state: string = 'STATE') {
    const encodedRedirectUri = encodeURIComponent(redirectUri)
    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`
    window.location.href = url
  }

  /**
   * 保存图片到系统相册（微信环境）
   * @param localId 图片的本地ID，通过 uploadImage 或 getLocalImgData 获取
   */
  saveImageToPhotosAlbum(localId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wx.saveImageToPhotosAlbum({
        localId,
        success: () => {
          resolve()
        },
        fail: (err: any) => {
          reject(err)
        }
      })
    })
  }

  /**
   * 获取本地图片数据（用于预览）
   * @param localId 图片的本地ID
   */
  getLocalImgData(localId: string): Promise<{ localData: string }> {
    return new Promise((resolve, reject) => {
      this.wx.getLocalImgData({
        localId,
        success: (res: any) => {
          resolve(res)
        },
        fail: (err: any) => {
          reject(err)
        }
      })
    })
  }

  /**
   * 预览图片（微信环境）
   * @param current 当前要预览的图片链接
   * @param urls 图片链接列表
   */
  previewImage(current: string, urls: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wx.previewImage({
        current, // 当前显示的图片链接
        urls, // 需要预览的图片链接列表
        success: () => {
          resolve()
        },
        fail: (err: any) => {
          reject(err)
        }
      })
    })
  }
}

const weixin = new WeixinSDK()
export default weixin
