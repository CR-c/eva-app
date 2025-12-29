import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

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

  useEffect(() => {
    // 获取路由参数
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    
    if (params?.petId) {
      setPetId(params.petId)
      loadPetData(params.petId)
      loadGrowthPhotos(params.petId)
    }
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

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleMore = () => {
    Taro.showActionSheet({
      itemList: ['分享照片', '设为头像', '删除照片'],
      success: (res) => {
        const actions = ['分享照片', '设为头像', '删除照片']
        Taro.showToast({
          title: actions[res.tapIndex],
          icon: 'none'
        })
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

  return (
    <View className="growth-gallery">
      {/* 顶部导航 */}
      <View className="header">
        <View className="nav-button" onClick={handleBack}>
          <Text className="nav-icon">←</Text>
        </View>
        <Text className="nav-title">{pet?.name}的成长历程</Text>
        <View className="nav-button" onClick={handleMore}>
          <Text className="nav-icon">⋮</Text>
        </View>
      </View>

      <View className="main-content">
        {growthPhotos.length === 0 ? (
          // 空状态
          <View className="empty-state">
            <Text className="empty-icon">📸</Text>
            <Text className="empty-title">还没有成长照片</Text>
            <Text className="empty-subtitle">添加第一张照片开始记录{pet?.name}的成长历程吧</Text>
            <View className="add-first-photo-button" onClick={handleAddPhoto}>
              <Text className="add-button-text">添加照片</Text>
            </View>
          </View>
        ) : (
          <>
            {/* 主要照片展示区域 */}
            <View className="photo-display">
              <View className="photo-container">
                <Image 
                  className="main-photo"
                  src={currentPhoto.photo}
                  mode="aspectFill"
                />
                
                {/* 照片信息覆盖层 */}
                <View className="photo-overlay">
                  <View className="date-badge">
                    <Text className="date-icon">📅</Text>
                    <Text className="date-text">{formatDate(currentPhoto.date)}</Text>
                  </View>
                  
                  <View className="age-label">
                    <Text className="age-text">{getAgeText(currentPhoto.ageInMonths)}</Text>
                    <Text className="phase-text">成长阶段</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 时间线滑块 */}
            <View className="timeline-scrubber">
              <View className="scrubber-header">
                <Text className="scrubber-label">时间线</Text>
                <Text className="photo-counter">{currentIndex + 1} / {growthPhotos.length} 张照片</Text>
              </View>
              
              <View className="slider-container">
                {/* 滑块轨道 */}
                <View className="slider-track">
                  <View 
                    className="slider-progress"
                    style={{ width: `${((currentIndex + 1) / growthPhotos.length) * 100}%` }}
                  />
                </View>
                
                {/* 滑块拖拽点 */}
                <View 
                  className="slider-thumb"
                  style={{ left: `${(currentIndex / (growthPhotos.length - 1)) * 100}%` }}
                />
                
                {/* 刻度点 */}
                <View className="slider-ticks">
                  {growthPhotos.map((_, index) => (
                    <View 
                      key={index}
                      className={`tick ${index === currentIndex ? 'active' : ''}`}
                      style={{ left: `${(index / (growthPhotos.length - 1)) * 100}%` }}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* 播放控制 */}
            <View className="playback-controls">
              <View className="control-button" onClick={handlePrevious}>
                <Text className="control-icon">⏮️</Text>
              </View>
              
              <View className="play-button" onClick={handlePlayPause}>
                <Text className="play-icon">{isPlaying ? '⏸️' : '▶️'}</Text>
              </View>
              
              <View className="control-button" onClick={handleNext}>
                <Text className="control-icon">⏭️</Text>
              </View>
            </View>

            {/* 添加照片按钮 */}
            <View className="add-photo-section">
              <View className="add-photo-button" onClick={handleAddPhoto}>
                <View className="add-icon-circle">
                  <Text className="add-icon">+</Text>
                </View>
                <Text className="add-photo-text">添加里程碑照片</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  )
}

export default GrowthGallery