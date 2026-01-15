import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { Button, Card } from '@nutui/nutui-react-taro'
import {
  useImagePicker,
  useLocation,
  useStorage,
  useToast,
  usePlatformCompat,
} from '@/hooks/usePlatformAPI'
import { isWeApp, isTT } from '@/utils/platform'

/**
 * 平台API演示组件
 * 展示如何处理不同平台的API差异
 */
const PlatformDemo: React.FC = () => {
  const [demoData, setDemoData] = useState<any>(null)

  // 使用平台API Hooks
  const { chooseImage, loading: imageLoading, error: imageError } = useImagePicker()
  const { getLocation, loading: locationLoading, error: locationError } = useLocation()
  const { setItem, getItem, loading: storageLoading } = useStorage()
  const { showSuccess, showError } = useToast()
  const { platform, config, checkFeatureSupport } = usePlatformCompat()

  // 图片选择演示
  const handleImagePicker = async () => {
    if (!checkFeatureSupport('image-picker')) {
      showError('当前平台不支持图片选择')
      return
    }

    const result = await chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })

    if (result) {
      setDemoData({ type: 'images', data: result.tempFilePaths })
      showSuccess('图片选择成功')
    }
  }

  // 位置获取演示
  const handleGetLocation = async () => {
    if (!checkFeatureSupport('location')) {
      showError('当前平台不支持位置获取')
      return
    }

    const result = await getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
    })

    if (result) {
      setDemoData({
        type: 'location',
        data: {
          latitude: result.latitude,
          longitude: result.longitude,
          accuracy: result.accuracy,
        },
      })
      showSuccess('位置获取成功')
    }
  }

  // 存储演示
  const handleStorage = async () => {
    const testData = {
      platform,
      timestamp: Date.now(),
      message: '这是一个测试数据',
    }

    // 存储数据
    const setResult = await setItem('demo_data', testData)
    if (setResult) {
      // 读取数据
      const getData = await getItem('demo_data')
      if (getData) {
        setDemoData({ type: 'storage', data: getData })
        showSuccess('存储操作成功')
      }
    }
  }

  // 平台特定功能演示
  const handlePlatformSpecific = async () => {
    if (isWeApp()) {
      // 微信小程序特定功能
      showSuccess('微信小程序特定功能')
      setDemoData({
        type: 'platform',
        data: {
          platform: '微信小程序',
          features: ['分享到朋友圈', '微信支付', '获取用户信息'],
        },
      })
    } else if (isTT()) {
      // 抖音小程序特定功能
      showSuccess('抖音小程序特定功能')
      setDemoData({
        type: 'platform',
        data: {
          platform: '抖音小程序',
          features: ['分享到抖音', '抖音登录', '视频播放'],
        },
      })
    } else {
      showSuccess(`${platform} 平台功能`)
      setDemoData({
        type: 'platform',
        data: {
          platform,
          features: ['通用功能'],
        },
      })
    }
  }

  return (
    <View className='p-4 space-y-4'>
      {/* 平台信息 */}
      <Card className='bg-blue-50 border-blue-200'>
        <View className='p-4'>
          <Text className='text-lg font-semibold text-blue-800 mb-2'>当前平台信息</Text>
          <View className='space-y-1'>
            <Text className='text-blue-700'>平台: {config.name}</Text>
            <Text className='text-blue-700'>
              最大图片大小: {(config.maxImageSize / 1024 / 1024).toFixed(1)}MB
            </Text>
            <Text className='text-blue-700'>
              最大存储大小: {(config.maxStorageSize / 1024 / 1024).toFixed(1)}MB
            </Text>
            <Text className='text-blue-700'>
              支持的图片格式: {config.supportedImageTypes.join(', ')}
            </Text>
          </View>
        </View>
      </Card>

      {/* 功能按钮 */}
      <View className='grid grid-cols-2 gap-3'>
        <Button
          type='primary'
          size='small'
          loading={imageLoading}
          disabled={!checkFeatureSupport('image-picker')}
          onClick={handleImagePicker}
          className='bg-green-500 border-green-500'
        >
          选择图片
        </Button>

        <Button
          type='primary'
          size='small'
          loading={locationLoading}
          disabled={!checkFeatureSupport('location')}
          onClick={handleGetLocation}
          className='bg-orange-500 border-orange-500'
        >
          获取位置
        </Button>

        <Button
          type='primary'
          size='small'
          loading={storageLoading}
          onClick={handleStorage}
          className='bg-purple-500 border-purple-500'
        >
          存储测试
        </Button>

        <Button
          type='primary'
          size='small'
          onClick={handlePlatformSpecific}
          className='bg-pink-500 border-pink-500'
        >
          平台特性
        </Button>
      </View>

      {/* 错误信息 */}
      {(imageError || locationError) && (
        <Card className='bg-red-50 border-red-200'>
          <View className='p-4'>
            <Text className='text-red-800 font-semibold mb-2'>错误信息</Text>
            {imageError && <Text className='text-red-700'>图片: {imageError}</Text>}
            {locationError && <Text className='text-red-700'>位置: {locationError}</Text>}
          </View>
        </Card>
      )}

      {/* 演示结果 */}
      {demoData && (
        <Card className='bg-gray-50 border-gray-200'>
          <View className='p-4'>
            <Text className='text-lg font-semibold text-gray-800 mb-2'>
              演示结果 ({demoData.type})
            </Text>

            {demoData.type === 'images' && (
              <View className='grid grid-cols-3 gap-2'>
                {demoData.data.map((url: string, index: number) => (
                  <View key={index} className='aspect-square bg-gray-200 rounded'>
                    <Text className='text-xs text-gray-600 p-1'>图片 {index + 1}</Text>
                  </View>
                ))}
              </View>
            )}

            {demoData.type === 'location' && (
              <View className='space-y-1'>
                <Text className='text-gray-700'>纬度: {demoData.data.latitude.toFixed(6)}</Text>
                <Text className='text-gray-700'>经度: {demoData.data.longitude.toFixed(6)}</Text>
                {demoData.data.accuracy && (
                  <Text className='text-gray-700'>精度: {demoData.data.accuracy}m</Text>
                )}
              </View>
            )}

            {demoData.type === 'storage' && (
              <View className='space-y-1'>
                <Text className='text-gray-700'>平台: {demoData.data.platform}</Text>
                <Text className='text-gray-700'>
                  时间戳: {new Date(demoData.data.timestamp).toLocaleString()}
                </Text>
                <Text className='text-gray-700'>消息: {demoData.data.message}</Text>
              </View>
            )}

            {demoData.type === 'platform' && (
              <View className='space-y-2'>
                <Text className='text-gray-700 font-medium'>{demoData.data.platform}</Text>
                <View className='space-y-1'>
                  {demoData.data.features.map((feature: string, index: number) => (
                    <Text key={index} className='text-gray-600 text-sm'>
                      • {feature}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Card>
      )}

      {/* 功能支持状态 */}
      <Card className='bg-yellow-50 border-yellow-200'>
        <View className='p-4'>
          <Text className='text-lg font-semibold text-yellow-800 mb-2'>功能支持状态</Text>
          <View className='grid grid-cols-2 gap-2'>
            {[
              { key: 'image-picker', name: '图片选择' },
              { key: 'location', name: '位置获取' },
              { key: 'share', name: '分享功能' },
              { key: 'scan-code', name: '扫码功能' },
              { key: 'phone-call', name: '拨打电话' },
              { key: 'clipboard', name: '剪贴板' },
            ].map(({ key, name }) => (
              <View key={key} className='flex items-center justify-between'>
                <Text className='text-yellow-700'>{name}</Text>
                <Text
                  className={`text-xs px-2 py-1 rounded ${
                    checkFeatureSupport(key)
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}
                >
                  {checkFeatureSupport(key) ? '支持' : '不支持'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Card>
    </View>
  )
}

export default PlatformDemo
