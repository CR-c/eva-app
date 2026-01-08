import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import Taro, { useDidShow } from '@tarojs/taro'
import { getPetById, getGrowthPhotoList, deleteGrowthPhoto } from '@/services/pet'
import type { PetVO, GrowthPhoto } from '@/constants/types'
import './index.scss'

// 获取导航栏信息
const getNavBarInfo = () => {
  try {
    const systemInfo = Taro.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 44
    const menuButton = Taro.getMenuButtonBoundingClientRect()
    const menuButtonMarginTop = menuButton.top - statusBarHeight
    const navBarHeight = menuButton.height + menuButtonMarginTop * 2
    return { statusBarHeight, navBarHeight, totalHeight: statusBarHeight + navBarHeight }
  } catch {
    return { statusBarHeight: 44, navBarHeight: 44, totalHeight: 88 }
  }
}

function GrowthGallery() {
  const navBarInfo = getNavBarInfo()
  const [pet, setPet] = useState<PetVO | null>(null)
  const [growthPhotos, setGrowthPhotos] = useState<GrowthPhoto[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [petId, setPetId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params

    if (params?.petId) {
      const id = parseInt(params.petId)
      setPetId(id)
      loadData(id)
    } else {
      setLoading(false)
    }
  }, [])

  // 页面显示时刷新照片
  useDidShow(() => {
    if (petId) {
      loadPhotos(petId)
    }
  })

  // 自动播放
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && growthPhotos.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % growthPhotos.length)
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, growthPhotos.length])

  const loadData = async (id: number) => {
    try {
      const petData = await getPetById(id)
      setPet(petData)
      await loadPhotos(id)
    } catch (error) {
      console.error('Failed to load data:', error)
      Taro.showToast({ title: '加载数据失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const loadPhotos = async (id: number) => {
    try {
      const result = await getGrowthPhotoList(id, { pageSize: 100 })
      // 按日期升序排序（从旧到新）
      const sorted = (result.list || []).sort((a, b) =>
        new Date(a.photoDate).getTime() - new Date(b.photoDate).getTime()
      )
      setGrowthPhotos(sorted)
    } catch (error) {
      console.error('Failed to load photos:', error)
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleMore = () => {
    const currentPhoto = growthPhotos[currentIndex]
    if (!currentPhoto || !petId) return

    Taro.showActionSheet({
      itemList: ['分享照片', '删除照片'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            Taro.showToast({ title: '分享功能开发中', icon: 'none' })
            break
          case 1:
            handleDeletePhoto(currentPhoto.id)
            break
        }
      }
    })
  }

  const handleDeletePhoto = (photoId: number) => {
    Taro.showModal({
      title: '删除照片',
      content: '确定要删除这张照片吗？',
      success: async (res) => {
        if (res.confirm && petId) {
          try {
            await deleteGrowthPhoto(petId, photoId)
            const newPhotos = growthPhotos.filter(p => p.id !== photoId)
            setGrowthPhotos(newPhotos)
            if (currentIndex >= newPhotos.length && newPhotos.length > 0) {
              setCurrentIndex(newPhotos.length - 1)
            }
            Taro.showToast({ title: '删除成功', icon: 'success' })
          } catch (error) {
            console.error('Delete photo failed:', error)
          }
        }
      }
    })
  }

  const handlePrevious = () => {
    if (growthPhotos.length > 0) {
      setCurrentIndex(prev => prev === 0 ? growthPhotos.length - 1 : prev - 1)
    }
  }

  const handleNext = () => {
    if (growthPhotos.length > 0) {
      setCurrentIndex(prev => (prev + 1) % growthPhotos.length)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleAddPhoto = () => {
    if (petId) {
      Taro.navigateTo({
        url: `/pages/addGrowthPhoto/index?petId=${petId}`
      })
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAgeText = (ageInMonths?: number) => {
    if (!ageInMonths) return ''
    const years = Math.floor(ageInMonths / 12)
    const months = ageInMonths % 12

    if (years === 0) {
      return `${months}个月大`
    } else if (months === 0) {
      return `${years}岁`
    } else {
      return `${years}岁${months}个月`
    }
  }

  const currentPhoto = growthPhotos[currentIndex]

  if (loading) {
    return (
      <View className="min-h-screen bg-[#0d171c]">
        {/* 自定义导航栏 */}
        <View
          style={{
            paddingTop: `${navBarInfo.statusBarHeight}px`,
            background: 'transparent'
          }}
        >
          <View
            className="flex items-center justify-between"
            style={{
              padding: '0 32rpx',
              height: `${navBarInfo.navBarHeight}px`
            }}
          >
            <View
              className="flex items-center justify-center"
              style={{
                width: '72rpx',
                height: '72rpx',
                borderRadius: '36rpx',
                background: 'rgba(255,255,255,0.1)'
              }}
              onClick={handleBack}
            >
              <Text style={{ fontSize: '32rpx', color: '#ffffff' }}>←</Text>
            </View>
            <Text className="font-bold text-white" style={{ fontSize: '32rpx' }}>
              成长历程
            </Text>
            <View style={{ width: '72rpx' }} />
          </View>
        </View>

        {/* 加载骨架屏 */}
        <View className="flex items-center justify-center" style={{ height: '60vh' }}>
          <Text className="text-white" style={{ fontSize: '28rpx' }}>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-[#0d171c]">
      {/* 自定义导航栏 */}
      <View
        style={{
          paddingTop: `${navBarInfo.statusBarHeight}px`,
          background: 'transparent',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100
        }}
      >
        <View
          className="flex items-center justify-between"
          style={{
            padding: '0 32rpx',
            height: `${navBarInfo.navBarHeight}px`
          }}
        >
          <View
            className="flex items-center justify-center"
            style={{
              width: '72rpx',
              height: '72rpx',
              borderRadius: '36rpx',
              background: 'rgba(0,0,0,0.3)'
            }}
            onClick={handleBack}
          >
            <Text style={{ fontSize: '32rpx', color: '#ffffff' }}>←</Text>
          </View>
          <Text className="font-bold text-white" style={{ fontSize: '32rpx' }}>
            {pet?.name || '宠物'}的成长历程
          </Text>
          <View
            className="flex items-center justify-center"
            style={{
              width: '72rpx',
              height: '72rpx',
              borderRadius: '36rpx',
              background: 'rgba(0,0,0,0.3)'
            }}
            onClick={handleMore}
          >
            <Text style={{ fontSize: '32rpx', color: '#ffffff' }}>⋯</Text>
          </View>
        </View>
      </View>

      {growthPhotos.length === 0 ? (
        /* 空状态 */
        <View
          className="flex flex-col items-center justify-center text-center"
          style={{ minHeight: '100vh', padding: '0 48rpx' }}
        >
          <Text style={{ fontSize: '120rpx', marginBottom: '32rpx', opacity: 0.6 }}>📷</Text>
          <Text
            className="font-bold text-white"
            style={{ fontSize: '32rpx', marginBottom: '16rpx' }}
          >
            还没有成长照片
          </Text>
          <Text
            className="text-[#94a3b8]"
            style={{ fontSize: '26rpx', lineHeight: '40rpx', maxWidth: '400rpx', marginBottom: '32rpx' }}
          >
            添加第一张照片开始记录{pet?.name || '宠物'}的成长历程吧
          </Text>
          <Button
            type="primary"
            onClick={handleAddPhoto}
            style={{
              height: '88rpx',
              borderRadius: '44rpx',
              background: '#25aff4',
              paddingLeft: '48rpx',
              paddingRight: '48rpx'
            }}
          >
            <Text className="text-white font-bold" style={{ fontSize: '28rpx' }}>
              添加照片
            </Text>
          </Button>
        </View>
      ) : (
        <>
          {/* 主要照片展示区域 */}
          <View style={{ position: 'relative', height: '65vh' }}>
            <Image
              src={currentPhoto.photoUrl}
              mode="aspectFill"
              style={{ width: '100%', height: '100%' }}
            />

            {/* 渐变遮罩 */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(13,23,28,0.9) 0%, transparent 100%)'
              }}
            />

            {/* 照片信息 */}
            <View
              style={{
                position: 'absolute',
                bottom: '32rpx',
                left: '32rpx',
                right: '32rpx'
              }}
            >
              <View className="flex items-end justify-between">
                <View
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '16rpx',
                    padding: '16rpx 24rpx'
                  }}
                >
                  <View className="flex items-center" style={{ gap: '8rpx', marginBottom: '4rpx' }}>
                    <Text style={{ fontSize: '24rpx', color: '#ffffff' }}>📅</Text>
                    <Text className="text-white" style={{ fontSize: '24rpx' }}>
                      {formatDate(currentPhoto.photoDate)}
                    </Text>
                  </View>
                </View>

                {currentPhoto.ageInMonths && (
                  <View
                    style={{
                      background: 'rgba(37,175,244,0.8)',
                      borderRadius: '16rpx',
                      padding: '16rpx 24rpx'
                    }}
                  >
                    <Text className="font-bold text-white" style={{ fontSize: '26rpx' }}>
                      {getAgeText(currentPhoto.ageInMonths)}
                    </Text>
                  </View>
                )}
              </View>

              {/* 标签 */}
              {currentPhoto.tags && currentPhoto.tags.length > 0 && (
                <View className="flex flex-wrap" style={{ gap: '8rpx', marginTop: '16rpx' }}>
                  {currentPhoto.tags.map(tag => (
                    <View
                      key={tag.id}
                      style={{
                        padding: '8rpx 16rpx',
                        borderRadius: '12rpx',
                        background: 'rgba(255,255,255,0.2)'
                      }}
                    >
                      <Text style={{ fontSize: '22rpx', color: '#ffffff' }}>
                        {tag.icon} {tag.name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* 时间线滑块 */}
          <View style={{ padding: '32rpx' }}>
            <View className="flex items-center justify-between" style={{ marginBottom: '24rpx' }}>
              <Text className="font-bold text-white" style={{ fontSize: '28rpx' }}>时间线</Text>
              <Text className="text-[#94a3b8]" style={{ fontSize: '24rpx' }}>
                {currentIndex + 1} / {growthPhotos.length} 张照片
              </Text>
            </View>

            {/* 进度条 */}
            <View style={{ position: 'relative', marginBottom: '32rpx' }}>
              <View
                style={{
                  height: '8rpx',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '4rpx'
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${((currentIndex + 1) / growthPhotos.length) * 100}%`,
                    background: '#25aff4',
                    borderRadius: '4rpx',
                    transition: 'width 0.3s'
                  }}
                />
              </View>

              {/* 缩略图列表 */}
              <ScrollView
                scrollX
                style={{
                  marginTop: '24rpx',
                  whiteSpace: 'nowrap'
                }}
              >
                <View className="flex" style={{ gap: '12rpx' }}>
                  {growthPhotos.map((photo, index) => (
                    <View
                      key={photo.id}
                      style={{
                        width: '100rpx',
                        height: '100rpx',
                        borderRadius: '12rpx',
                        overflow: 'hidden',
                        border: index === currentIndex ? '4rpx solid #25aff4' : '4rpx solid transparent',
                        opacity: index === currentIndex ? 1 : 0.6,
                        flexShrink: 0
                      }}
                      onClick={() => setCurrentIndex(index)}
                    >
                      <Image
                        src={photo.photoUrl}
                        mode="aspectFill"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* 播放控制 */}
            <View className="flex items-center justify-center" style={{ gap: '48rpx', marginBottom: '32rpx' }}>
              <View
                className="flex items-center justify-center"
                style={{
                  width: '88rpx',
                  height: '88rpx',
                  borderRadius: '44rpx',
                  border: '2rpx solid rgba(255,255,255,0.3)'
                }}
                onClick={handlePrevious}
              >
                <Text style={{ fontSize: '32rpx' }}>⏮️</Text>
              </View>

              <View
                className="flex items-center justify-center"
                style={{
                  width: '112rpx',
                  height: '112rpx',
                  borderRadius: '56rpx',
                  background: '#25aff4'
                }}
                onClick={handlePlayPause}
              >
                <Text style={{ fontSize: '40rpx' }}>{isPlaying ? '⏸️' : '▶️'}</Text>
              </View>

              <View
                className="flex items-center justify-center"
                style={{
                  width: '88rpx',
                  height: '88rpx',
                  borderRadius: '44rpx',
                  border: '2rpx solid rgba(255,255,255,0.3)'
                }}
                onClick={handleNext}
              >
                <Text style={{ fontSize: '32rpx' }}>⏭️</Text>
              </View>
            </View>

            {/* 添加照片按钮 */}
            <Button
              type="primary"
              onClick={handleAddPhoto}
              style={{
                width: '100%',
                height: '88rpx',
                borderRadius: '44rpx',
                background: 'linear-gradient(135deg, #25aff4 0%, #1e40af 100%)',
                border: 'none'
              }}
            >
              <View className="flex items-center justify-center" style={{ gap: '12rpx' }}>
                <Text style={{ fontSize: '28rpx' }}>+</Text>
                <Text className="text-white font-bold" style={{ fontSize: '28rpx' }}>
                  添加里程碑照片
                </Text>
              </View>
            </Button>
          </View>
        </>
      )}
    </View>
  )
}

export default GrowthGallery
