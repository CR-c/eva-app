import Taro from '@tarojs/taro'
import { post, get } from '@/utils/request'
import type { PasswordLoginParams, WxLoginParams, LoginData, UserInfo } from '@/constants/types'

/**
 * 账号密码登录
 */
export async function passwordLogin(params: PasswordLoginParams): Promise<LoginData> {
  try {
    const response = await post<LoginData>('/api/system/auth/login', params, {
      showLoading: true,
    })
    return response.data
  } catch (error) {
    console.error('passwordLogin error:', error)
    throw error
  }
}

/**
 * 微信登录
 */
export async function wechatLogin(params: WxLoginParams): Promise<LoginData> {
  try {
    const response = await post<LoginData>('/api/system/auth/wechat/login', params, {
      showLoading: true,
    })
    return response.data
  } catch (error) {
    console.error('wechatLogin error:', error)
    throw error
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfo(): Promise<UserInfo> {
  try {
    const response = await get<UserInfo>('/api/system/auth/userInfo')
    return response.data
  } catch (error) {
    console.error('getUserInfo error:', error)
    throw error
  }
}

/**
 * 退出登录
 */
export async function logout(): Promise<void> {
  try {
    await post('/api/system/auth/logout')
  } catch (error) {
    console.error('logout error:', error)
    throw error
  }
}

/**
 * 微信一键登录（小程序专用）
 */
export async function wxMiniappLogin(): Promise<LoginData> {
  try {
    // 1. 获取微信登录 code
    const { code } = await Taro.login()

    if (!code) {
      throw new Error('获取微信登录 code 失败')
    }

    // 2. 调用后端接口换取 token
    const params: WxLoginParams = {
      code,
      type: 'miniapp',
    }

    return await wechatLogin(params)
  } catch (error) {
    console.error('wxMiniappLogin error:', error)
    Taro.showToast({
      title: '登录失败',
      icon: 'none',
    })
    throw error
  }
}
