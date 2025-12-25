import Taro from '@tarojs/taro'

interface CacheData<T> {
  data: T
  expire?: number
}

/**
 * 设置缓存
 * @param key 缓存键
 * @param data 缓存数据
 * @param expire 过期时间（秒），不传则永久有效
 */
export function setCache<T>(key: string, data: T, expire?: number): void {
  const cacheData: CacheData<T> = {
    data,
    expire: expire ? Date.now() + expire * 1000 : undefined,
  }
  Taro.setStorageSync(key, JSON.stringify(cacheData))
}

/**
 * 获取缓存
 * @param key 缓存键
 * @returns 缓存数据，不存在或已过期则返回 null
 */
export function getCache<T>(key: string): T | null {
  try {
    const cache = Taro.getStorageSync(key)
    if (!cache) return null

    const cacheData: CacheData<T> = JSON.parse(cache)

    // 检查是否过期
    if (cacheData.expire && Date.now() > cacheData.expire) {
      removeCache(key)
      return null
    }

    return cacheData.data
  } catch (error) {
    console.error('getCache error:', error)
    return null
  }
}

/**
 * 删除缓存
 * @param key 缓存键
 */
export function removeCache(key: string): void {
  Taro.removeStorageSync(key)
}

/**
 * 清空所有缓存
 */
export function clearCache(): void {
  Taro.clearStorageSync()
}
