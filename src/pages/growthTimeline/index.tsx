import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import Taro, { useDidShow } from '@tarojs/taro'
import { getPetById, getGrowthPhotoList, getTagList } from '@/services/pet'
import type { PetVO, GrowthPhoto, PetTag } from '@/constants/types'
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

function GrowthTimeline() {
  const navBarInfo = getNavBarInfo()
  const [pet, setPet] = useState<PetVO | null>(null)
  const [growthPhotos, setGrowthPhotos] = useState<GrowthPhoto[]>([])
  const [tags, setTags] = useState<PetTag[]>([])
  const [activeFilter, setActiveFilter] = useState<number | null>(null) // null = 所有
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

  // 页面显示时刷新照片列表
  useDidShow(() => {
    if (petId) {
      loadPhotos(petId, activeFilter)
    }
  })

  const loadData = async (id: number) => {
    try {
      const [petData, tagList] = await Promise.all([getPetById(id), getTagList()])
      setPet(petData)
      setTags(tagList)
      await loadPhotos(id, null)
    } catch (error) {
      console.error('Failed to load data:', error)
      Taro.showToast({ title: '加载数据失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const loadPhotos = async (id: number, tagId: number | null) => {
    try {
      const result = await getGrowthPhotoList(id, {
        tagId: tagId || undefined,
        pageSize: 100,
      })
      // 按日期降序排序
      const sorted = (result.list || []).sort(
        (a, b) => new Date(b.photoDate).getTime() - new Date(a.photoDate).getTime()
      )
      setGrowthPhotos(sorted)
    } catch (error) {
      console.error('Failed to load photos:', error)
    }
  }

  const handleFilterChange = (tagId: number | null) => {
    setActiveFilter(tagId)
    if (petId) {
      loadPhotos(petId, tagId)
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleAddPhoto = () => {
    if (petId) {
      Taro.navigateTo({
        url: `/pages/addGrowthPhoto/index?petId=${petId}`,
      })
    }
  }

  const handleViewGallery = () => {
    if (petId) {
      Taro.navigateTo({
        url: `/pages/growthGallery/index?petId=${petId}`,
      })
    }
  }

  const handlePhotoDetail = (_photoId: number) => {
    Taro.showToast({
      title: '查看照片详情',
      icon: 'none',
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  const getThenAndNowPhotos = () => {
    if (growthPhotos.length === 0) return { then: null, now: null }

    const sortedPhotos = [...growthPhotos].sort(
      (a, b) => new Date(a.photoDate).getTime() - new Date(b.photoDate).getTime()
    )

    return {
      then: sortedPhotos[0] || null,
      now: sortedPhotos[sortedPhotos.length - 1] || null,
    }
  }

  const { then, now } = getThenAndNowPhotos()

  if (loading) {
    return (
      <View className='min-h-screen bg-[#f5f7f8]'>
        {/* 自定义导航栏 */}
        <View
          className='bg-white'
          style={{
            paddingTop: `${navBarInfo.statusBarHeight}px`,
            borderBottom: '2rpx solid #f1f5f9',
          }}
        >
          <View
            className='flex items-center justify-between'
            style={{
              padding: '0 32rpx',
              height: `${navBarInfo.navBarHeight}px`,
            }}
          >
            <View
              className='flex items-center justify-center bg-[#f1f5f9]'
              style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx' }}
              onClick={handleBack}
            >
              <Text style={{ fontSize: '32rpx', color: '#0d171c' }}>←</Text>
            </View>
            <Text className='font-bold text-[#0d171c]' style={{ fontSize: '32rpx' }}>
              {pet?.name || '宠物'}的成长
            </Text>
            <View style={{ width: '72rpx' }} />
          </View>
        </View>

        {/* 加载骨架屏 */}
        <View style={{ padding: '48rpx 32rpx' }}>
          <View
            className='bg-[#e2e8f0]'
            style={{
              height: '300rpx',
              borderRadius: '24rpx',
              marginBottom: '32rpx',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <View className='flex' style={{ gap: '24rpx', marginBottom: '32rpx' }}>
            {[1, 2, 3, 4].map(i => (
              <View
                key={i}
                className='bg-[#e2e8f0]'
                style={{
                  width: '160rpx',
                  height: '64rpx',
                  borderRadius: '32rpx',
                }}
              />
            ))}
          </View>
          <View className='bg-[#e2e8f0]' style={{ height: '400rpx', borderRadius: '24rpx' }} />
        </View>
      </View>
    )
  }

  return (
    <View className='min-h-screen bg-[#f5f7f8]'>
      {/* 自定义导航栏 */}
      <View
        className='bg-white'
        style={{
          paddingTop: `${navBarInfo.statusBarHeight}px`,
          borderBottom: '2rpx solid #f1f5f9',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <View
          className='flex items-center justify-between'
          style={{
            padding: '0 32rpx',
            height: `${navBarInfo.navBarHeight}px`,
          }}
        >
          <View
            className='flex items-center justify-center bg-[#f1f5f9]'
            style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx' }}
            onClick={handleBack}
          >
            <Text style={{ fontSize: '32rpx', color: '#0d171c' }}>←</Text>
          </View>
          <View className='flex flex-col items-center'>
            <Text className='font-bold text-[#0d171c]' style={{ fontSize: '32rpx' }}>
              {pet?.name || '宠物'}的成长
            </Text>
            <Text className='text-[#25aff4]' style={{ fontSize: '24rpx' }}>
              {pet?.age || 0}岁
            </Text>
          </View>
          <View
            className='flex items-center justify-center bg-[#eff6ff]'
            style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx' }}
            onClick={handleAddPhoto}
          >
            <Text style={{ fontSize: '32rpx', color: '#25aff4' }}>📷</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: `calc(100vh - ${navBarInfo.totalHeight}px)` }}>
        {/* Then vs Now 对比区域 */}
        {(then || now) && (
          <View style={{ padding: '32rpx' }}>
            <View className='flex items-center justify-between' style={{ marginBottom: '24rpx' }}>
              <Text className='font-bold text-[#0d171c]' style={{ fontSize: '32rpx' }}>
                那时 vs. 现在
              </Text>
              <Text
                className='text-[#25aff4] font-medium'
                style={{ fontSize: '26rpx' }}
                onClick={handleViewGallery}
              >
                查看相册 →
              </Text>
            </View>

            <View className='flex' style={{ gap: '24rpx' }}>
              {/* Then */}
              <View
                className='flex-1 bg-white'
                style={{
                  borderRadius: '24rpx',
                  padding: '16rpx',
                  boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.06)',
                }}
              >
                {then ? (
                  <>
                    <Image
                      src={then.photoUrl}
                      mode='aspectFill'
                      style={{
                        width: '100%',
                        height: '240rpx',
                        borderRadius: '16rpx',
                        marginBottom: '16rpx',
                      }}
                    />
                    <Text
                      className='block font-bold text-[#0d171c]'
                      style={{ fontSize: '26rpx', marginBottom: '4rpx' }}
                    >
                      那时 ({getAgeText(then.ageInMonths)})
                    </Text>
                    <Text className='block text-[#64748b]' style={{ fontSize: '22rpx' }}>
                      {formatDate(then.photoDate)}
                    </Text>
                  </>
                ) : (
                  <View
                    className='flex items-center justify-center bg-[#f8fafc]'
                    style={{ height: '240rpx', borderRadius: '16rpx' }}
                  >
                    <Text className='text-[#94a3b8]' style={{ fontSize: '24rpx' }}>
                      暂无早期照片
                    </Text>
                  </View>
                )}
              </View>

              {/* Now */}
              <View
                className='flex-1 bg-white'
                style={{
                  borderRadius: '24rpx',
                  padding: '16rpx',
                  boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.06)',
                }}
              >
                {now && now !== then ? (
                  <>
                    <Image
                      src={now.photoUrl}
                      mode='aspectFill'
                      style={{
                        width: '100%',
                        height: '240rpx',
                        borderRadius: '16rpx',
                        marginBottom: '16rpx',
                      }}
                    />
                    <Text
                      className='block font-bold text-[#0d171c]'
                      style={{ fontSize: '26rpx', marginBottom: '4rpx' }}
                    >
                      现在 ({getAgeText(now.ageInMonths)})
                    </Text>
                    <Text className='block text-[#64748b]' style={{ fontSize: '22rpx' }}>
                      {formatDate(now.photoDate)}
                    </Text>
                  </>
                ) : (
                  <View
                    className='flex items-center justify-center bg-[#f8fafc]'
                    style={{ height: '240rpx', borderRadius: '16rpx' }}
                  >
                    <Text className='text-[#94a3b8]' style={{ fontSize: '24rpx' }}>
                      暂无近期照片
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* 筛选器 */}
        <View style={{ padding: '0 32rpx', marginBottom: '32rpx' }}>
          <ScrollView scrollX style={{ whiteSpace: 'nowrap' }}>
            <View className='flex' style={{ gap: '20rpx', paddingBottom: '16rpx' }}>
              {/* 所有照片 */}
              <View
                className='flex items-center justify-center'
                style={{
                  height: '72rpx',
                  padding: '0 32rpx',
                  borderRadius: '36rpx',
                  background: activeFilter === null ? '#25aff4' : '#ffffff',
                  border: activeFilter === null ? 'none' : '2rpx solid #e2e8f0',
                  boxShadow:
                    activeFilter === null ? '0 8rpx 24rpx rgba(37, 175, 244, 0.3)' : 'none',
                }}
                onClick={() => handleFilterChange(null)}
              >
                <Text
                  style={{
                    fontSize: '26rpx',
                    fontWeight: activeFilter === null ? '700' : '500',
                    color: activeFilter === null ? '#ffffff' : '#0d171c',
                  }}
                >
                  所有照片
                </Text>
              </View>
              {/* 标签筛选 */}
              {tags.map(tag => (
                <View
                  key={tag.id}
                  className='flex items-center justify-center'
                  style={{
                    height: '72rpx',
                    padding: '0 32rpx',
                    borderRadius: '36rpx',
                    background: activeFilter === tag.id ? '#25aff4' : '#ffffff',
                    border: activeFilter === tag.id ? 'none' : '2rpx solid #e2e8f0',
                    boxShadow:
                      activeFilter === tag.id ? '0 8rpx 24rpx rgba(37, 175, 244, 0.3)' : 'none',
                  }}
                  onClick={() => handleFilterChange(tag.id)}
                >
                  {tag.icon && <Text style={{ marginRight: '8rpx' }}>{tag.icon}</Text>}
                  <Text
                    style={{
                      fontSize: '26rpx',
                      fontWeight: activeFilter === tag.id ? '700' : '500',
                      color: activeFilter === tag.id ? '#ffffff' : '#0d171c',
                    }}
                  >
                    {tag.name}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 时间线 */}
        <View style={{ padding: '0 32rpx 64rpx', position: 'relative' }}>
          {growthPhotos.length === 0 ? (
            <View
              className='flex flex-col items-center justify-center text-center'
              style={{ minHeight: '500rpx' }}
            >
              <Text style={{ fontSize: '120rpx', marginBottom: '32rpx', opacity: 0.6 }}>📷</Text>
              <Text
                className='font-bold text-[#0d171c]'
                style={{ fontSize: '32rpx', marginBottom: '16rpx' }}
              >
                还没有成长照片
              </Text>
              <Text
                className='text-[#64748b]'
                style={{
                  fontSize: '26rpx',
                  lineHeight: '40rpx',
                  maxWidth: '400rpx',
                  marginBottom: '32rpx',
                }}
              >
                记录{pet?.name || '宠物'}的成长瞬间
              </Text>
              <Button
                type='primary'
                onClick={handleAddPhoto}
                style={{
                  height: '88rpx',
                  borderRadius: '44rpx',
                  background: '#25aff4',
                  paddingLeft: '48rpx',
                  paddingRight: '48rpx',
                }}
              >
                <Text className='text-white font-bold' style={{ fontSize: '28rpx' }}>
                  添加第一张成长照片
                </Text>
              </Button>
            </View>
          ) : (
            <View style={{ position: 'relative' }}>
              {/* 时间线轴 */}
              <View
                style={{
                  position: 'absolute',
                  left: '24rpx',
                  top: 0,
                  bottom: 0,
                  width: '4rpx',
                  background: 'linear-gradient(to bottom, #25aff4 0%, rgba(37,175,244,0.2) 100%)',
                  borderRadius: '2rpx',
                }}
              />

              <View style={{ display: 'flex', flexDirection: 'column', gap: '48rpx' }}>
                {growthPhotos.map((photo, index) => (
                  <View
                    key={photo.id}
                    style={{ position: 'relative', paddingLeft: '64rpx' }}
                    onClick={() => handlePhotoDetail(photo.id)}
                  >
                    {/* 时间线节点 */}
                    <View
                      style={{
                        position: 'absolute',
                        left: '8rpx',
                        top: '32rpx',
                        width: '32rpx',
                        height: '32rpx',
                        background: '#25aff4',
                        borderRadius: '16rpx',
                        border: '6rpx solid #f5f7f8',
                        boxShadow: '0 4rpx 8rpx rgba(37,175,244,0.2)',
                      }}
                    />

                    {/* 照片卡片 */}
                    <View
                      className='bg-white'
                      style={{
                        borderRadius: '24rpx',
                        overflow: 'hidden',
                        boxShadow: '0 4rpx 24rpx rgba(0,0,0,0.06)',
                        border: '2rpx solid rgba(0,0,0,0.05)',
                      }}
                    >
                      <Image
                        src={photo.photoUrl}
                        mode='aspectFill'
                        style={{ width: '100%', height: '300rpx' }}
                      />
                      <View style={{ padding: '24rpx' }}>
                        <View
                          className='flex items-center justify-between'
                          style={{ marginBottom: '12rpx' }}
                        >
                          <Text className='font-bold text-[#0d171c]' style={{ fontSize: '28rpx' }}>
                            成长记录 #{growthPhotos.length - index}
                          </Text>
                          <Text className='text-[#94a3b8]' style={{ fontSize: '24rpx' }}>
                            ⋯
                          </Text>
                        </View>
                        <Text
                          className='block text-[#64748b]'
                          style={{ fontSize: '24rpx', marginBottom: '12rpx' }}
                        >
                          {formatDate(photo.photoDate)}{' '}
                          {photo.ageInMonths ? `• ${getAgeText(photo.ageInMonths)}` : ''}
                        </Text>
                        {/* 标签 */}
                        {photo.tags && photo.tags.length > 0 && (
                          <View
                            className='flex flex-wrap'
                            style={{ gap: '8rpx', marginBottom: '12rpx' }}
                          >
                            {photo.tags.map(tag => (
                              <View
                                key={tag.id}
                                style={{
                                  padding: '4rpx 16rpx',
                                  borderRadius: '16rpx',
                                  background: '#eff6ff',
                                }}
                              >
                                <Text style={{ fontSize: '22rpx', color: '#25aff4' }}>
                                  {tag.icon} {tag.name}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                        {photo.description && (
                          <Text
                            className='block text-[#475569]'
                            style={{ fontSize: '26rpx', lineHeight: '40rpx' }}
                          >
                            {photo.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}

                {/* 时间线起点 */}
                <View
                  className='flex items-center'
                  style={{ position: 'relative', paddingLeft: '64rpx', height: '64rpx' }}
                >
                  <View
                    style={{
                      position: 'absolute',
                      left: '12rpx',
                      width: '24rpx',
                      height: '24rpx',
                      background: '#94a3b8',
                      borderRadius: '12rpx',
                      border: '6rpx solid #f5f7f8',
                    }}
                  />
                  <Text className='text-[#94a3b8] italic' style={{ fontSize: '26rpx' }}>
                    {pet?.name}的诞生 {pet?.birthDate ? `• ${formatDate(pet.birthDate)}` : ''}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default GrowthTimeline
