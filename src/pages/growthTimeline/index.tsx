import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Card, Button, Tag, Loading, Empty } from '@nutui/nutui-react-taro'
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

function GrowthTimeline() {
  const [pet, setPet] = useState<Pet | null>(null)
  const [growthPhotos, setGrowthPhotos] = useState<GrowthPhoto[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [petId, setPetId] = useState('')
  const [loading, setLoading] = useState(true)

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

  const filterOptions = [
    { key: 'all', label: '所有照片' },
    { key: 'milestones', label: '里程碑' },
    { key: 'vet', label: '看医生' },
    { key: 'training', label: '训练' }
  ]

  if (loading) {
    return (
      <BasePage 
        title={`${pet?.name || '宠物'}的成长`} 
        safeArea={true} 
        className="bg-gradient-to-b from-gray-50 to-white"
        rightContent={
          <Button size="small" type="primary" onClick={handleAddPhoto}>
            📷
          </Button>
        }
      >
        <View className="flex justify-center items-center h-64">
          <Loading type="spinner" />
          <Text className="ml-2 text-gray-500">加载中...</Text>
        </View>
      </BasePage>
    )
  }

  return (
    <BasePage 
      title={`${pet?.name || '宠物'}的成长`} 
      safeArea={true} 
      className="bg-gradient-to-b from-gray-50 to-white"
      rightContent={
        <Button size="small" type="primary" onClick={handleAddPhoto}>
          📷
        </Button>
      }
    >
      <ScrollView className="h-screen pb-8" scrollY>
        {/* Then vs Now 对比区域 */}
        {(then || now) && (
          <View className="px-4 py-6">
            <View className="flex justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">那时 vs. 现在</Text>
              <Button size="small" fill="outline" onClick={handleViewGallery}>
                查看相册
              </Button>
            </View>
            
            <View className="grid grid-cols-2 gap-4">
              {/* Then */}
              <Card className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                {then ? (
                  <>
                    <Image 
                      className="w-full h-32 rounded-xl mb-3"
                      src={then.photo}
                      mode="aspectFill"
                    />
                    <Text className="text-sm font-semibold text-gray-900 mb-1 block">
                      那时 ({getAgeText(then.ageInMonths)})
                    </Text>
                    <Text className="text-xs text-gray-500 block">
                      {formatDate(then.date)}
                    </Text>
                  </>
                ) : (
                  <View className="h-32 flex items-center justify-center bg-gray-50 rounded-xl mb-3">
                    <Text className="text-sm text-gray-400">暂无早期照片</Text>
                  </View>
                )}
              </Card>

              {/* Now */}
              <Card className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                {now ? (
                  <>
                    <Image 
                      className="w-full h-32 rounded-xl mb-3"
                      src={now.photo}
                      mode="aspectFill"
                    />
                    <Text className="text-sm font-semibold text-gray-900 mb-1 block">
                      现在 ({getAgeText(now.ageInMonths)})
                    </Text>
                    <Text className="text-xs text-gray-500 block">
                      {formatDate(now.date)}
                    </Text>
                  </>
                ) : (
                  <View className="h-32 flex items-center justify-center bg-gray-50 rounded-xl mb-3">
                    <Text className="text-sm text-gray-400">暂无近期照片</Text>
                  </View>
                )}
              </Card>
            </View>
          </View>
        )}

        {/* 筛选器 */}
        <View className="px-4 py-4">
          <ScrollView className="w-full" scrollX>
            <View className="flex gap-3 pb-2">
              {filterOptions.map((option) => (
                <Tag
                  key={option.key}
                  type={activeFilter === option.key ? 'primary' : 'default'}
                  onClick={() => setActiveFilter(option.key)}
                  className="px-4 py-2 rounded-full cursor-pointer"
                >
                  {option.label}
                </Tag>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 时间线 */}
        <View className="px-4 pb-8">
          {growthPhotos.length === 0 ? (
            <Empty
              image="https://img12.360buyimg.com/imagetools/jfs/t1/33761/13/9873/4611/5c9b8c2fE676a2df8/de7dc02b1b76c3d8.png"
              description="还没有成长记录"
            >
              <Button type="primary" onClick={handleAddPhoto}>
                添加第一张成长照片
              </Button>
            </Empty>
          ) : (
            <View className="relative">
              {/* 时间线轴 */}
              <View className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-primary-300" />
              
              <View className="space-y-6">
                {growthPhotos.map((photo, index) => (
                  <View key={photo.id} className="relative flex items-start gap-4">
                    {/* 时间线节点 */}
                    <View className="relative z-10 w-3 h-3 bg-primary-500 rounded-full border-2 border-white shadow-lg mt-4" />
                    
                    {/* 照片卡片 */}
                    <Card 
                      className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-98 transition-all cursor-pointer"
                      onClick={() => handlePhotoDetail(photo.id)}
                    >
                      <View className="flex gap-4">
                        <Image 
                          className="w-20 h-20 rounded-xl flex-shrink-0"
                          src={photo.photo}
                          mode="aspectFill"
                        />
                        <View className="flex-1">
                          <View className="flex justify-between items-start mb-2">
                            <Text className="text-sm font-semibold text-gray-900 block">
                              成长记录 #{growthPhotos.length - index}
                            </Text>
                            <Text className="text-xs text-gray-400">⋯</Text>
                          </View>
                          
                          <Text className="text-xs text-gray-500 mb-2 block">
                            {formatDate(photo.date)} • {getAgeText(photo.ageInMonths)}
                          </Text>
                          
                          {photo.notes && (
                            <Text className="text-sm text-gray-700 mb-3 leading-relaxed block">
                              {photo.notes}
                            </Text>
                          )}
                          
                          <Tag type="success" size="small">
                            成长
                          </Tag>
                        </View>
                      </View>
                    </Card>
                  </View>
                ))}
                
                {/* 时间线起点 */}
                <View className="relative flex items-center gap-4">
                  <View className="w-4 h-4 bg-accent-500 rounded-full border-2 border-white shadow-lg" />
                  <Text className="text-sm text-gray-600">
                    {pet?.name}的诞生 • {pet ? formatDate(pet.createdAt) : ''}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </BasePage>
  )
}

export default GrowthTimeline