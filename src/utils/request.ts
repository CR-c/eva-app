import Taro from '@tarojs/taro'
import type { ApiResponse } from '@/constants/types'
import { getCache } from './cache'
import { CACHE_KEYS } from '@/constants/cache'
import { ROUTES } from '@/constants/routes'

// 基础 URL，实际项目中应从环境变量读取
const BASE_URL = 'https://api.example.com'

// 正在进行的请求 Map，用于防止重复请求
const pendingRequests = new Map<string, Promise<any>>()

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  preventDuplicate?: boolean // 是否防止重复请求
}

/**
 * 生成请求唯一标识
 */
function getRequestKey(url: string, method: string, data: any): string {
  return `${method}:${url}:${JSON.stringify(data)}`
}

/**
 * 处理 401 未授权
 */
function handle401(): void {
  Taro.showToast({
    title: '登录已失效',
    icon: 'none',
  })

  // 跳转到登录页
  setTimeout(() => {
    Taro.reLaunch({
      url: ROUTES.LOGIN,
    })
  }, 1500)
}

/**
 * 统一请求封装
 */
export async function request<T = any>(
  options: RequestOptions
): Promise<ApiResponse<T>> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoading = false,
    preventDuplicate = true,
  } = options

  // 防止重复请求
  const requestKey = getRequestKey(url, method, data)
  if (preventDuplicate && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)
  }

  // 获取 token
  const token = getCache<string>(CACHE_KEYS.TOKEN)

  // 构建请求头
  const requestHeader: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
  }

  // 自动注入 token
  if (token) {
    requestHeader.Authorization = `Bearer ${token}`
  }

  // 显示 loading
  if (showLoading) {
    Taro.showLoading({
      title: '加载中...',
      mask: true,
    })
  }

  // 发起请求
  const requestPromise = Taro.request({
    url: `${BASE_URL}${url}`,
    method,
    data,
    header: requestHeader,
  })
    .then((res) => {
      const response = res.data as ApiResponse<T>

      // 业务状态码判断
      if (response.code === 200) {
        return response
      } else if (response.code === 401) {
        // 登录态失效
        handle401()
        throw new Error('登录已失效')
      } else {
        // 其他业务错误
        Taro.showToast({
          title: response.msg || '请求失败',
          icon: 'none',
        })
        throw new Error(response.msg || '请求失败')
      }
    })
    .catch((error) => {
      // 网络错误
      console.error('Request error:', error)
      Taro.showToast({
        title: '网络异常',
        icon: 'none',
      })
      throw error
    })
    .finally(() => {
      // 移除请求记录
      pendingRequests.delete(requestKey)

      // 隐藏 loading
      if (showLoading) {
        Taro.hideLoading()
      }
    })

  // 记录请求
  if (preventDuplicate) {
    pendingRequests.set(requestKey, requestPromise)
  }

  return requestPromise
}

// 便捷方法
export const get = <T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
) => request<T>({ url, method: 'GET', data, ...options })

export const post = <T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
) => request<T>({ url, method: 'POST', data, ...options })

export const put = <T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
) => request<T>({ url, method: 'PUT', data, ...options })

export const del = <T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
) => request<T>({ url, method: 'DELETE', data, ...options })
