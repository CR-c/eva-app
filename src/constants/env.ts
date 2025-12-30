/**
 * 环境配置
 */

// 声明全局变量类型
declare const __DEV__: string | undefined
declare const NODE_ENV: string | undefined

// 开发环境 API 地址
const DEV_BASE_URL = 'http://localhost:8080'

// 生产环境 API 地址
const PROD_BASE_URL = 'https://api.eva-app.com'

// 获取当前环境
const getCurrentEnv = () => {
  try {
    // 方案1：使用编译时定义的 NODE_ENV
    if (typeof NODE_ENV !== 'undefined') {
      return NODE_ENV
    }
    
    // 方案2：使用 process.env.NODE_ENV
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
      return process.env.NODE_ENV
    }
    
    // 方案3：使用 __DEV__ 标志
    if (typeof __DEV__ !== 'undefined') {
      return __DEV__ === 'true' ? 'development' : 'production'
    }
    
    // 默认为开发环境
    return 'development'
  } catch (error) {
    // 如果出现任何错误，默认返回开发环境
    return 'development'
  }
}

const currentEnv = getCurrentEnv()

// 根据环境变量判断当前环境
export const BASE_URL = currentEnv === 'production' ? PROD_BASE_URL : DEV_BASE_URL

// 是否为生产环境
export const IS_PROD = currentEnv === 'production'

// 是否为开发环境
export const IS_DEV = currentEnv === 'development'
