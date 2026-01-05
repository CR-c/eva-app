import Taro from '@tarojs/taro'

/**
 * 平台类型枚举
 */
export enum PlatformType {
  WEAPP = 'weapp',      // 微信小程序
  TT = 'tt',            // 抖音小程序
  ALIPAY = 'alipay',    // 支付宝小程序
  SWAN = 'swan',        // 百度小程序
  QQ = 'qq',            // QQ小程序
  JD = 'jd',            // 京东小程序
  H5 = 'h5',            // H5
  RN = 'rn'             // React Native
}

/**
 * 获取当前运行平台
 */
export const getCurrentPlatform = (): PlatformType => {
  return process.env.TARO_ENV as PlatformType
}

/**
 * 判断是否为微信小程序
 */
export const isWeApp = (): boolean => {
  return getCurrentPlatform() === PlatformType.WEAPP
}

/**
 * 判断是否为抖音小程序
 */
export const isTT = (): boolean => {
  return getCurrentPlatform() === PlatformType.TT
}

/**
 * 判断是否为小程序环境
 */
export const isMiniProgram = (): boolean => {
  const platform = getCurrentPlatform()
  return [
    PlatformType.WEAPP,
    PlatformType.TT,
    PlatformType.ALIPAY,
    PlatformType.SWAN,
    PlatformType.QQ,
    PlatformType.JD
  ].includes(platform)
}

/**
 * 平台特定的API调用结果
 */
export interface PlatformAPIResult<T = any> {
  success: boolean
  data?: T
  error?: string
  platform: PlatformType
}

/**
 * 平台API处理器基类
 */
export abstract class PlatformAPIHandler {
  protected platform: PlatformType

  constructor() {
    this.platform = getCurrentPlatform()
  }

  /**
   * 执行平台特定的API调用
   */
  abstract execute(...args: any[]): Promise<PlatformAPIResult<any>>

  /**
   * 获取错误处理策略
   */
  protected getErrorMessage(error: any): string {
    if (typeof error === 'string') return error
    if (error?.errMsg) return error.errMsg
    if (error?.message) return error.message
    return '操作失败'
  }

  /**
   * 创建成功结果
   */
  protected createSuccessResult<T>(data: T): PlatformAPIResult<T> {
    return {
      success: true,
      data,
      platform: this.platform
    }
  }

  /**
   * 创建失败结果
   */
  protected createErrorResult(error: any): PlatformAPIResult {
    return {
      success: false,
      error: this.getErrorMessage(error),
      platform: this.platform
    }
  }
}

/**
 * 图片选择API处理器
 */
export class ImagePickerHandler extends PlatformAPIHandler {
  async execute(options: {
    count?: number
    sizeType?: string[]
    sourceType?: string[]
  } = {}): Promise<PlatformAPIResult<{ tempFilePaths: string[] }>> {
    try {
      const defaultOptions = {
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      }

      const finalOptions = { ...defaultOptions, ...options }

      // 平台特定处理
      if (this.platform === PlatformType.TT) {
        // 抖音小程序可能有不同的参数要求
        const result = await Taro.chooseImage({
          count: finalOptions.count,
          sizeType: finalOptions.sizeType as any,
          sourceType: finalOptions.sourceType as any
        })
        return this.createSuccessResult(result)
      } else if (this.platform === PlatformType.WEAPP) {
        // 微信小程序标准处理
        const result = await Taro.chooseImage({
          count: finalOptions.count,
          sizeType: finalOptions.sizeType as any,
          sourceType: finalOptions.sourceType as any
        })
        return this.createSuccessResult(result)
      } else {
        // 其他平台通用处理
        const result = await Taro.chooseImage({
          count: finalOptions.count,
          sizeType: finalOptions.sizeType as any,
          sourceType: finalOptions.sourceType as any
        })
        return this.createSuccessResult(result)
      }
    } catch (error) {
      console.error(`[${this.platform}] 图片选择失败:`, error)
      return this.createErrorResult(error)
    }
  }
}

/**
 * 位置获取API处理器
 */
export class LocationHandler extends PlatformAPIHandler {
  async execute(options: {
    type?: 'wgs84' | 'gcj02'
    altitude?: boolean
    isHighAccuracy?: boolean
  } = {}): Promise<PlatformAPIResult<{
    latitude: number
    longitude: number
    speed?: number
    accuracy?: number
    altitude?: number
  }>> {
    try {
      const defaultOptions = {
        type: 'gcj02' as const,
        isHighAccuracy: true
      }

      const finalOptions = { ...defaultOptions, ...options }

      // 平台特定处理
      if (this.platform === PlatformType.TT) {
        // 抖音小程序可能需要特殊权限处理
        const result = await Taro.getLocation({
          ...finalOptions,
          // 抖音小程序特定配置
        })
        return this.createSuccessResult(result)
      } else if (this.platform === PlatformType.WEAPP) {
        // 微信小程序需要用户授权
        try {
          const authResult = await Taro.getSetting()
          if (!authResult.authSetting['scope.userLocation']) {
            await Taro.authorize({ scope: 'scope.userLocation' })
          }
        } catch (authError) {
          // 授权失败，引导用户手动开启
          await Taro.showModal({
            title: '位置权限',
            content: '需要获取您的位置信息，请在设置中开启位置权限',
            showCancel: false
          })
          throw new Error('位置权限未授权')
        }

        const result = await Taro.getLocation(finalOptions)
        return this.createSuccessResult(result)
      } else {
        // 其他平台通用处理
        const result = await Taro.getLocation(finalOptions)
        return this.createSuccessResult(result)
      }
    } catch (error) {
      console.error(`[${this.platform}] 位置获取失败:`, error)
      return this.createErrorResult(error)
    }
  }
}

/**
 * 存储API处理器
 */
export class StorageHandler extends PlatformAPIHandler {
  async execute(_args?: any[]): Promise<PlatformAPIResult<any>> {
    // This is a placeholder implementation for the abstract method
    // Actual storage operations are handled by specific methods
    return this.createSuccessResult(null)
  }

  async setItem(key: string, value: any): Promise<PlatformAPIResult<void>> {
    try {
      // 平台特定处理
      if (this.platform === PlatformType.TT) {
        // 抖音小程序可能有存储限制
        const serializedValue = JSON.stringify(value)
        if (serializedValue.length > 1024 * 1024) { // 1MB限制
          throw new Error('数据过大，无法存储')
        }
      }

      await Taro.setStorage({
        key,
        data: value
      })

      return this.createSuccessResult(undefined)
    } catch (error) {
      console.error(`[${this.platform}] 存储设置失败:`, error)
      return this.createErrorResult(error)
    }
  }

  async getItem<T = any>(key: string): Promise<PlatformAPIResult<T>> {
    try {
      const result = await Taro.getStorage({ key })
      return this.createSuccessResult(result.data)
    } catch (error) {
      // 数据不存在不算错误
      if (error?.errMsg?.includes('data not found')) {
        return this.createSuccessResult(null as any)
      }
      console.error(`[${this.platform}] 存储获取失败:`, error)
      return this.createErrorResult(error)
    }
  }

  async removeItem(key: string): Promise<PlatformAPIResult<void>> {
    try {
      await Taro.removeStorage({ key })
      return this.createSuccessResult(undefined)
    } catch (error) {
      console.error(`[${this.platform}] 存储删除失败:`, error)
      return this.createErrorResult(error)
    }
  }
}

/**
 * 分享API处理器
 */
export class ShareHandler extends PlatformAPIHandler {
  async execute(): Promise<PlatformAPIResult<void>> {
    try {
      if (this.platform === PlatformType.TT) {
        // 抖音小程序分享处理
        await Taro.showShareMenu({
          withShareTicket: true
        })
      } else if (this.platform === PlatformType.WEAPP) {
        // 微信小程序分享处理
        await Taro.showShareMenu({
          withShareTicket: true
        })
      } else {
        // 其他平台可能不支持分享
        throw new Error('当前平台不支持分享功能')
      }

      return this.createSuccessResult(undefined)
    } catch (error) {
      console.error(`[${this.platform}] 分享设置失败:`, error)
      return this.createErrorResult(error)
    }
  }
}

/**
 * 平台API管理器
 */
export class PlatformAPIManager {
  private static instance: PlatformAPIManager
  private imagePickerHandler: ImagePickerHandler
  private locationHandler: LocationHandler
  private storageHandler: StorageHandler
  private shareHandler: ShareHandler
  private platform: PlatformType

  private constructor() {
    this.platform = getCurrentPlatform()
    this.imagePickerHandler = new ImagePickerHandler()
    this.locationHandler = new LocationHandler()
    this.storageHandler = new StorageHandler()
    this.shareHandler = new ShareHandler()
  }

  static getInstance(): PlatformAPIManager {
    if (!PlatformAPIManager.instance) {
      PlatformAPIManager.instance = new PlatformAPIManager()
    }
    return PlatformAPIManager.instance
  }

  /**
   * 图片选择
   */
  async chooseImage(options?: {
    count?: number
    sizeType?: string[]
    sourceType?: string[]
  }): Promise<PlatformAPIResult<{ tempFilePaths: string[] }>> {
    return this.imagePickerHandler.execute(options)
  }

  /**
   * 获取位置
   */
  async getLocation(options?: {
    type?: 'wgs84' | 'gcj02'
    altitude?: boolean
    isHighAccuracy?: boolean
  }): Promise<PlatformAPIResult<{
    latitude: number
    longitude: number
    speed?: number
    accuracy?: number
    altitude?: number
  }>> {
    return this.locationHandler.execute(options)
  }

  /**
   * 存储操作
   */
  get storage() {
    return {
      setItem: (key: string, value: any) => this.storageHandler.setItem(key, value),
      getItem: <T = any>(key: string) => this.storageHandler.getItem<T>(key),
      removeItem: (key: string) => this.storageHandler.removeItem(key)
    }
  }

  /**
   * 分享设置
   */
  async setupShare(_options?: {
    title?: string
    path?: string
    imageUrl?: string
  }): Promise<PlatformAPIResult<void>> {
    return this.shareHandler.execute()
  }

  /**
   * 显示Toast消息（平台兼容）
   */
  async showToast(options: {
    title: string
    icon?: 'success' | 'error' | 'loading' | 'none'
    duration?: number
  }): Promise<PlatformAPIResult<void>> {
    try {
      const defaultOptions = {
        icon: 'none' as const,
        duration: 2000
      }

      const finalOptions = { ...defaultOptions, ...options }

      // 平台特定处理
      if (this.platform === PlatformType.TT) {
        // 抖音小程序可能有不同的图标支持
        if (finalOptions.icon === 'error') {
          finalOptions.icon = 'none' // 抖音可能不支持error图标
        }
      }

      await Taro.showToast(finalOptions)
      return this.createSuccessResult(undefined)
    } catch (error) {
      console.error(`[${getCurrentPlatform()}] Toast显示失败:`, error)
      return this.createErrorResult(error)
    }
  }

  private createSuccessResult<T>(data: T): PlatformAPIResult<T> {
    return {
      success: true,
      data,
      platform: this.platform
    }
  }

  private createErrorResult(error: any): PlatformAPIResult {
    return {
      success: false,
      error: typeof error === 'string' ? error : error?.message || '操作失败',
      platform: this.platform
    }
  }
}

/**
 * 导出单例实例
 */
export const platformAPI = PlatformAPIManager.getInstance()

/**
 * 平台兼容性检查工具
 */
export const PlatformCompat = {
  /**
   * 检查API是否支持
   */
  isAPISupported(apiName: string): boolean {
    const platform = getCurrentPlatform()
    
    // API支持矩阵
    const apiSupport: Record<string, PlatformType[]> = {
      'chooseImage': [PlatformType.WEAPP, PlatformType.TT, PlatformType.ALIPAY, PlatformType.SWAN],
      'getLocation': [PlatformType.WEAPP, PlatformType.TT, PlatformType.ALIPAY],
      'showShareMenu': [PlatformType.WEAPP, PlatformType.TT],
      'scanCode': [PlatformType.WEAPP, PlatformType.TT, PlatformType.ALIPAY],
      'makePhoneCall': [PlatformType.WEAPP, PlatformType.TT, PlatformType.ALIPAY],
      'setClipboardData': [PlatformType.WEAPP, PlatformType.TT, PlatformType.ALIPAY]
    }

    return apiSupport[apiName]?.includes(platform) || false
  },

  /**
   * 获取平台特定的配置
   */
  getPlatformConfig() {
    const platform = getCurrentPlatform()
    
    const configs = {
      [PlatformType.WEAPP]: {
        name: '微信小程序',
        maxImageSize: 10 * 1024 * 1024, // 10MB
        maxStorageSize: 10 * 1024 * 1024, // 10MB
        supportedImageTypes: ['jpg', 'png', 'gif'],
        supportedShareTypes: ['shareAppMessage', 'shareTimeline']
      },
      [PlatformType.TT]: {
        name: '抖音小程序',
        maxImageSize: 5 * 1024 * 1024, // 5MB
        maxStorageSize: 5 * 1024 * 1024, // 5MB
        supportedImageTypes: ['jpg', 'png'],
        supportedShareTypes: ['shareAppMessage']
      }
    }

    return configs[platform] || {
      name: '未知平台',
      maxImageSize: 1 * 1024 * 1024,
      maxStorageSize: 1 * 1024 * 1024,
      supportedImageTypes: ['jpg', 'png'],
      supportedShareTypes: []
    }
  }
}