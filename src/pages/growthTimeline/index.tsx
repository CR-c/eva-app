import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
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

function GrowthTimeline() {
  const [pet, setPet] = useState<Pet | null>(null)
  const [growthPhotos, setGrowthPhotos] = useState<GrowthPhoto[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
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
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setGrowthPhotos(petPhotos)
      }
    } catch (error) {
      console.log('No growth photos found')
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleAddPhoto = () => {
    Taro.navigateTo({
      url: `/pages/addGrowthPhoto/index?petId=${petId}`
    })
  }

  const handleViewGallery = () => {
    Taro.navigateTo({
      url: `/pages/growthGallery/index?petId=${petId}`
    })
  }

  const handlePhotoDetail = (photoId: string) => {
    Taro.showToast({
      title: '查看照片详情',
      icon: 'none'
    })
  }

  const handleEditMemory = (photoId: string) => {
    Taro.showToast({
      title: '编辑记忆功能',
      icon: 'none'
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

  const getThenAndNowPhotos = () => {
    if (growthPhotos.length === 0) return { then: null, now: null }
    
    const sortedPhotos = [...growthPhotos].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    return {
      then: sortedPhotos[0] || null,
      now: sortedPhotos[sortedPhotos.length - 1] || null
    }
  }

  const { then, now } = getThenAndNowPhotos()

  return (
    <View className="growth-timeline">
      {/* 顶部导航 */}
      <View className="header">
        <View className="nav-button" onClick={handleBack}>
          <Text className="nav-icon">←</Text>
        </View>
        <View className="header-info">
          <Text className="pet-name">{pet?.name || '宠物'}的成长</Text>
          <Text className="pet-age">{pet ? getAgeText(pet.age * 12) : ''}</Text>
        </View>
        <View className="add-button" onClick={handleAddPhoto}>
          <Text className="add-icon">📷</Text>
        </View>
      </View>

      <ScrollView className="content" scrollY>
        {/* Then vs Now 对比区域 */}
        {(then || now) && (
          <View className="then-now-section">
            <View className="section-header">
              <Text className="section-title">那时 vs. 现在</Text>
              <View className="view-gallery-button" onClick={handleViewGallery}>
                <Text className="gallery-text">查看相册</Text>
              </View>
            </View>
            
            <View className="comparison-grid">
              {/* Then */}
              <View className="comparison-card">
                {then ? (
                  <>
                    <Image 
                      className="comparison-image"
                      src={then.photo}
                      mode="aspectFill"
                    />
                    <View className="comparison-info">
                      <Text className="comparison-title">那时 ({getAgeText(then.ageInMonths)})</Text>
                      <Text className="comparison-date">{formatDate(then.date)}</Text>
                    </View>
                  </>
                ) : (
                  <View className="empty-comparison">
                    <Text className="empty-text">暂无早期照片</Text>
                  </View>
                )}
              </View>

              {/* Now */}
              <View className="comparison-card">
                {now ? (
                  <>
                    <Image 
                      className="comparison-image"
                      src={now.photo}
                      mode="aspectFill"
                    />
                    <View className="comparison-info">
                      <Text className="comparison-title">现在 ({getAgeText(now.ageInMonths)})</Text>
                      <Text className="comparison-date">{formatDate(now.date)}</Text>
                    </View>
                  </>
                ) : (
                  <View className="empty-comparison">
                    <Text className="empty-text">暂无近期照片</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* 筛选器 */}
        <View className="filters-section">
          <ScrollView className="filters-scroll" scrollX>
            <View className="filters-container">
              <View 
                className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                <Text className="filter-text">所有照片</Text>
              </View>
              <View 
                className={`filter-button ${activeFilter === 'milestones' ? 'active' : ''}`}
                onClick={() => setActiveFilter('milestones')}
              >
                <Text className="filter-text">里程碑</Text>
              </View>
              <View 
                className={`filter-button ${activeFilter === 'vet' ? 'active' : ''}`}
                onClick={() => setActiveFilter('vet')}
              >
                <Text className="filter-text">看医生</Text>
              </View>
              <View 
                className={`filter-button ${activeFilter === 'training' ? 'active' : ''}`}
                onClick={() => setActiveFilter('training')}
              >
                <Text className="filter-text">训练</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* 时间线 */}
        <View className="timeline-section">
          {/* 时间线轴 */}
          <View className="timeline-axis" />
          
          {growthPhotos.length === 0 ? (
            <View className="empty-timeline">
              <Text className="empty-icon">📸</Text>
              <Text className="empty-title">还没有成长记录</Text>
              <Text className="empty-subtitle">点击右上角按钮添加第一张成长照片吧</Text>
            </View>
          ) : (
            <View className="timeline-items">
              {growthPhotos.map((photo, index) => (
                <View key={photo.id} className="timeline-item">
                  {/* 时间线节点 */}
                  <View className="timeline-dot" />
                  
                  {/* 照片卡片 */}
                  <View className="photo-card" onClick={() => handlePhotoDetail(photo.id)}>
                    <Image 
                      className="photo-image"
                      src={photo.photo}
                      mode="aspectFill"
                    />
                    <View className="photo-info">
                      <View className="photo-header">
                        <View className="photo-details">
                          <Text className="photo-title">成长记录 #{growthPhotos.length - index}</Text>
                          <Text className="photo-date">{formatDate(photo.date)} • {getAgeText(photo.ageInMonths)}</Text>
                        </View>
                        <View className="photo-actions">
                          <Text className="action-icon">⋯</Text>
                        </View>
                      </View>
                      
                      {photo.notes && (
                        <Text className="photo-notes">{photo.notes}</Text>
                      )}
                      
                      <View className="photo-tags">
                        <View className="tag milestone">
                          <Text className="tag-text">成长</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
              
              {/* 时间线起点 */}
              <View className="timeline-start">
                <View className="start-dot" />
                <Text className="start-text">{pet?.name}的诞生 • {pet ? formatDate(pet.createdAt) : ''}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default GrowthTimeline