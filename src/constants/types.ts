/**
 * API 统一响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

/**
 * 用户信息
 */
export interface UserInfo {
  userId: number
  username: string
  nickname: string
  avatar?: string
  phone?: string
  openid?: string
  unionid?: string
  email?: string
  gender?: 0 | 1 | 2 // 0: 女, 1: 男, 2: 未知
  birthday?: string
  signature?: string
  location?: string
  roles?: string[]
  permissions?: string[]
}

/**
 * 账号密码登录参数
 */
export interface PasswordLoginParams {
  username: string
  password: string
  captcha?: string
  uuid?: string
}

/**
 * 微信登录参数
 */
export interface WxLoginParams {
  code: string
  type: 'miniapp' | 'mp'
  encryptedData?: string
  iv?: string
}

/**
 * 登录响应数据
 */
export interface LoginData {
  token: string
  userId: number
  username: string
  nickname: string
  avatar?: string
  roles?: string[]
  permissions?: string[]
}

/**
 * 检查用户是否存在的响应
 */
export interface CheckUserExistData {
  exist: boolean
  openid: string
}

/**
 * 注册请求参数
 */
export interface RegisterParams {
  code: string
  nickname: string
  phone: string
  avatar?: string
}

/**
 * 微信用户信息
 */
export interface WxUserInfo {
  nickName: string
  avatarUrl: string
  gender: 0 | 1 | 2
}
