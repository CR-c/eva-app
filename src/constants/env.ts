/**
 * 环境配置
 */

// 开发环境 API 地址
const DEV_BASE_URL = 'http://localhost:8080'

// 生产环境 API 地址
const PROD_BASE_URL = 'https://api.eva-app.com'

// 根据环境变量判断当前环境
export const BASE_URL = process.env.NODE_ENV === 'production' ? PROD_BASE_URL : DEV_BASE_URL

// 是否为生产环境
export const IS_PROD = process.env.NODE_ENV === 'production'

// 是否为开发环境
export const IS_DEV = process.env.NODE_ENV === 'development'
