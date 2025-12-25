import Taro from '@tarojs/taro'
import { post } from '@/utils/request'
import type { LoginParams, LoginData, UserInfo, CheckUserExistData, RegisterParams } from '@/constants/types'

/**
 * 账号密码登录（暂不对接后端，模拟登录）
 */
export async function passwordLogin(username: string, password: string): Promise<LoginData> {
  return new Promise((resolve, reject) => {
    // 模拟网络延迟
    setTimeout(() => {
      // 验证账号密码
      if (username === 'admin' && password === 'admin123') {
        // 模拟返回的登录数据
        const mockData: LoginData = {
          token: 'mock_token_' + Date.now(),
          userInfo: {
            id: 'mock_user_001',
            nickname: 'Admin',
            avatar: '',
            phone: '',
            openid: '',
            email: 'admin@eva-app.com',
            gender: 1,
            birthday: '',
            signature: 'EVA-01 Test Type Administrator',
            location: '',
          },
        }
        resolve(mockData)
      } else {
        reject(new Error('账号或密码错误'))
      }
    }, 800)
  })
}

/**
 * 检查用户是否存在（模拟接口）
 */
export async function checkUserExist(code: string): Promise<CheckUserExistData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟：根据 code 判断用户是否已注册
      // 这里简单模拟：随机返回是否存在
      const mockOpenid = 'wx_openid_' + Date.now()
      const exist = Math.random() > 0.5 // 50% 概率模拟用户已存在

      resolve({
        exist,
        openid: mockOpenid,
      })
    }, 500)
  })
}

/**
 * 用户注册（模拟接口）
 */
export async function register(params: RegisterParams): Promise<LoginData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: LoginData = {
        token: 'mock_token_' + Date.now(),
        userInfo: {
          id: 'mock_user_' + Date.now(),
          nickname: params.nickname,
          avatar: params.avatar || '',
          phone: params.phone,
          openid: 'wx_openid_' + Date.now(),
          email: '',
          gender: 0,
          birthday: '',
          signature: '新用户',
          location: '',
        },
      }
      resolve(mockData)
    }, 800)
  })
}

/**
 * 微信一键登录
 */
export async function wxLogin(): Promise<LoginData> {
  try {
    // 1. 获取微信登录 code
    const { code } = await Taro.login()

    if (!code) {
      throw new Error('获取微信登录 code 失败')
    }

    // 2. 调用后端接口换取 token
    const params: LoginParams = { code }
    const response = await post<LoginData>('/api/auth/login', params, {
      showLoading: true,
    })

    return response.data
  } catch (error) {
    console.error('wxLogin error:', error)
    Taro.showToast({
      title: '登录失败',
      icon: 'none',
    })
    throw error
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfo() {
  const response = await post('/api/auth/userInfo')
  return response.data
}
