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
  id: string
  nickname: string
  avatar?: string
  phone?: string
  openid?: string
  email?: string
  gender?: 0 | 1 | 2 // 0: 未知, 1: 男, 2: 女
  birthday?: string
  signature?: string
  location?: string
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  code: string
}

/**
 * 登录响应数据
 */
export interface LoginData {
  token: string
  userInfo: UserInfo
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
