import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Button, Loading, Empty, ActionSheet } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import BasePage from '@/components/BasePage'

interface Pet {
  id: string
  name: string
  breed: string
  age: number
  gender: 'male' | 'female'
  size: 'small' | 'medium' | 'large'
  photo?: string
  bio?: string
  createdAt: string
}

interface GrowthPhoto {
  id: string
  petId: string
  photo: string
  date: string
  notes: string
  ageInMonths: number
  tags: string[]
  createdAt: string
}

function GrowthGallery() {
  const [pet, setPet] = useState<Pet | null>(null)
  const [growthPhotos, setGrowthPhotos] = useState<GrowthPhoto[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [petId, setPetId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showActionSheet, setShowActionSheet] = useState(false)

  const actionSheetOptions = [
    { name: '分享照片', value: 'share' },
    { name: '设为头像', value: 'avatar' },
    { name: '删除照片', value: 'delete' }
  ]

  useEffect(() => {
    // 获取路由参数
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    
    if (params?.petId) {
      setPetId(params.petId)
      loadPetData(params.petId)
      loadGrowthPhotos(params.petId)
    }
    
    // 模拟加载时间
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && growthPhotos.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % growthPhotos.length)
      }, 2000) // 每2秒切换一张
    }
    return () => clearInterval(interval)
  }, [isPlaying, growthPhotos.length])

  const loadPetData = async (id: string) => {
    try {
      const storedPets = await Taro.getStorage({ key: 'pets' })
      if (storedPets.data && Array.isArray(storedPets.data)) {
        const petData = storedPets.data.find(p => p.id === id)
        if (petData) {
          setPet(petData)
        }
      }
    } catch (error) {
      console.error('Failed to load pet data:', error)
    }
  }

  const loadGrowthPhotos = async (id: string) => {
    try {
      const storedPhotos = await Taro.getStorage({ key: 'growthPhotos' })
      if (storedPhotos.data && Array.isArray(storedPhotos.data)) {
        const petPhotos = storedPhotos.data
          .filter(photo => photo.petId === id)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setGrowthPhotos(petPhotos)
      }
    } catch (error) {
      console.log('No growth photos found')
    }
  }

  const handleMore = () => {
    setShowActionSheet(true)
  }

  const handleActionSheetSelect = (item: any) => {
    setShowActionSheet(false)
    Taro.showToast({
      title: item.name,
      icon: 'none'
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
    Taro.navigateTo({
      url: `/pages/addGrowthPhoto/index?petId=${petId}`
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAgeText = (ageInMonths: number) => {
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
      <BasePage 
        title={`${pet?.name || '宠物'}的成长历程`} 
        safeArea={true} 
        className="bg-black"
        rightContent={
          <Button size="small" fill="outline" onClick={handleMore}>
            ⋮
          </Button>
        }
      >
        <View className="flex justify-center items-center h-64">
          <Loading type="spinner" />
          <Text className="ml-2 text-white">加载中...</Text>
        </View>
      </BasePage>
    )
  }

  return (
    <BasePage 
      title={`${pet?.name || '宠物'}的成长历程`} 
      safeArea={true} 
      className="bg-black"
      rightContent={
        <Button size="small" fill="outline" onClick={handleMore}>
          ⋮
        </Button>
      }
    >
      <View className="min-h-screen bg-black text-white">
        {growthPhotos.length === 0 ? (
          // 空状态
          <View className="flex flex-col items-center justify-center min-h-60vh text-center px-8">
            <Empty
              image="https://img12.360buyimg.com/imagetools/jfs/t1/33761/13/9873/4611/5c9b8c2fE676a2df8/de7dc02b1b76c3d8.png"
              description={
                <View className="text-center">
                  <Text className="text-lg font-bold text-white mb-2 block">
                    还没有成长照片
                  </Text>
                  <Text className="text-sm text-gray-400 leading-relaxed block">
                    添加第一张照片开始记录{pet?.name}的成长历程吧
                  </Text>
                </View>
              }
            >
              <Button type="primary" onClick={handleAddPhoto}>
                添加照片
              </Button>
            </Empty>
          </View>
        ) : (
          <>
            {/* 主要照片展示区域 */}
            <View className="relative h-96 mb-6">
              <Image 
                className="w-full h-full"
                src={currentPhoto.photo}
                mode="aspectFill"
              />
              
              {/* 照片信息覆盖层 */}
              <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <View className="absolute bottom-4 left-4 right-4">
                <View className="flex justify-between items-end">
                  <View className="bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                    <View className="flex items-center gap-2 mb-1">
                      <Text className="text-xs text-white">📅</Text>
                      <Text className="text-xs text-white">
                        {formatDate(currentPhoto.date)}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="bg-primary-500/80 px-3 py-2 rounded-lg backdrop-blur-sm">
                    <Text className="text-sm font-semibold text-white block">
                      {getAgeText(currentPhoto.ageInMonths)}
                    </Text>
                    <Text className="text-xs text-white/80 block">
                      成长阶段
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 时间线滑块 */}
            <View className="px-4 mb-6">
              <View className="flex justify-between items-center mb-3">
                <Text className="text-sm font-semibold text-white">时间线</Text>
                <Text className="text-xs text-gray-400">
                  {currentIndex + 1} / {growthPhotos.length} 张照片
                </Text>
              </View>
              
              <View className="relative">
                {/* 滑块轨道 */}
                <View className="h-1 bg-gray-700 rounded-full">
                  <View 
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / growthPhotos.length) * 100}%` }}
                  />
                </View>
                
                {/* 刻度点 */}
                <View className="absolute -top-1 left-0 right-0 h-3">
                  {growthPhotos.map((_, index) => (
                    <View 
                      key={index}
                      className={`absolute w-3 h-3 rounded-full border-2 border-white transition-all ${
                        index === currentIndex ? 'bg-primary-500' : 'bg-gray-600'
                      }`}
                      style={{ left: `${(index / (growthPhotos.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* 播放控制 */}
            <View className="flex justify-center items-center gap-8 mb-8">
              <Button 
                size="large" 
                fill="outline" 
                shape="round"
                onClick={handlePrevious}
                className="w-12 h-12 border-white text-white"
              >
                ⏮️
              </Button>
              
              <Button 
                size="large" 
                type="primary"
                shape="round"
                onClick={handlePlayPause}
                className="w-16 h-16"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </Button>
              
              <Button 
                size="large" 
                fill="outline" 
                shape="round"
                onClick={handleNext}
                className="w-12 h-12 border-white text-white"
              >
                ⏭️
              </Button>
            </View>

            {/* 添加照片按钮 */}
            <View className="px-4 pb-8">
              <Button 
                type="primary" 
                size="large"
                onClick={handleAddPhoto}
                className="w-full bg-gradient-to-r from-primary-500 to-accent-500"
              >
                <View className="flex items-center justify-center gap-2">
                  <Text className="text-lg">+</Text>
                  <Text>添加里程碑照片</Text>
                </View>
              </Button>
            </View>
          </>
        )}

        {/* ActionSheet */}
        <ActionSheet
          visible={showActionSheet}
          options={actionSheetOptions}
          onSelect={handleActionSheetSelect}
          onCancel={() => setShowActionSheet(false)}
        />
      </View>
    </BasePage>
  )
}

export default GrowthGallery