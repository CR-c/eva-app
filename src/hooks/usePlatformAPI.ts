import { useState, useCallback } from 'react'
import { platformAPI, PlatformAPIResult, getCurrentPlatform, PlatformCompat } from '@/utils/platform'

/**
 * 平台API Hook的状态
 */
interface PlatformAPIState<T = any> {
  loading: boolean
  data: T | null
  error: string | null
  platform: string
}

/**
 * 平台API Hook
 */
export const usePlatformAPI = <T = any>() => {
  const [state, setState] = useState<PlatformAPIState<T>>({
    loading: false,
    data: null,
    error: null,
    platform: getCurrentPlatform()
  })

  /**
   * 执行API调用的通用方法
   */
  const executeAPI = useCallback(async <R = T>(
    apiCall: () => Promise<PlatformAPIResult<R>>
  ): Promise<R | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await apiCall()
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          data: result.data as any,
          error: null
        }))
        return result.data || null
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || '操作失败'
        }))
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return null
    }
  }, [])

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setState({
      loading: false,
      data: null,
      error: null,
      platform: getCurrentPlatform()
    })
  }, [])

  return {
    ...state,
    executeAPI,
    reset
  }
}

/**
 * 图片选择Hook
 */
export const useImagePicker = () => {
  const { executeAPI, ...state } = usePlatformAPI<{ tempFilePaths: string[] }>()

  const chooseImage = useCallback(async (options?: {
    count?: number
    sizeType?: string[]
    sourceType?: string[]
  }) => {
    return executeAPI(() => platformAPI.chooseImage(options))
  }, [executeAPI])

  return {
    ...state,
    chooseImage
  }
}

/**
 * 位置获取Hook
 */
export const useLocation = () => {
  const { executeAPI, ...state } = usePlatformAPI<{
    latitude: number
    longitude: number
    speed?: number
    accuracy?: number
    altitude?: number
  }>()

  const getLocation = useCallback(async (options?: {
    type?: 'wgs84' | 'gcj02'
    altitude?: boolean
    isHighAccuracy?: boolean
  }) => {
    return executeAPI(() => platformAPI.getLocation(options))
  }, [executeAPI])

  return {
    ...state,
    getLocation
  }
}

/**
 * 存储Hook
 */
export const useStorage = () => {
  const { executeAPI, ...state } = usePlatformAPI()

  const setItem = useCallback(async (key: string, value: any) => {
    return executeAPI(() => platformAPI.storage.setItem(key, value))
  }, [executeAPI])

  const getItem = useCallback(async <T = any>(key: string) => {
    return executeAPI(() => platformAPI.storage.getItem<T>(key))
  }, [executeAPI])

  const removeItem = useCallback(async (key: string) => {
    return executeAPI(() => platformAPI.storage.removeItem(key))
  }, [executeAPI])

  return {
    ...state,
    setItem,
    getItem,
    removeItem
  }
}

/**
 * Toast消息Hook
 */
export const useToast = () => {
  const [loading, setLoading] = useState(false)

  const showToast = useCallback(async (options: {
    title: string
    icon?: 'success' | 'error' | 'loading' | 'none'
    duration?: number
  }) => {
    setLoading(true)
    try {
      const result = await platformAPI.showToast(options)
      return result.success
    } catch (error) {
      console.error('Toast显示失败:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const showSuccess = useCallback((title: string, duration?: number) => {
    return showToast({ title, icon: 'success', duration })
  }, [showToast])

  const showError = useCallback((title: string, duration?: number) => {
    return showToast({ title, icon: 'error', duration })
  }, [showToast])

  const showLoading = useCallback((title: string = '加载中...') => {
    return showToast({ title, icon: 'loading', duration: 0 })
  }, [showToast])

  return {
    loading,
    showToast,
    showSuccess,
    showError,
    showLoading
  }
}

/**
 * 平台兼容性Hook
 */
export const usePlatformCompat = () => {
  const platform = getCurrentPlatform()
  const config = PlatformCompat.getPlatformConfig()

  const isAPISupported = useCallback((apiName: string) => {
    return PlatformCompat.isAPISupported(apiName)
  }, [])

  const checkFeatureSupport = useCallback((feature: string) => {
    const supportMatrix = {
      'image-picker': isAPISupported('chooseImage'),
      'location': isAPISupported('getLocation'),
      'share': isAPISupported('showShareMenu'),
      'scan-code': isAPISupported('scanCode'),
      'phone-call': isAPISupported('makePhoneCall'),
      'clipboard': isAPISupported('setClipboardData')
    }

    return supportMatrix[feature] || false
  }, [isAPISupported])

  return {
    platform,
    config,
    isAPISupported,
    checkFeatureSupport
  }
}