import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Card, ActionSheet } from '@nutui/nutui-react-taro'
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

function Pets() {
  const [pets, setPets] = useState<Pet[]>([
    {
      id: '1',
      name: 'Buddy',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'male',
      size: 'large',
      photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNfgPRCj1TjU0V6N812loHs-xGWnz32LFlJNga9llQVEk7GqDBgEOI67iHM2yOVuLW8JDfQ8Z4HqTv-KKwKcVqNgsDCfuECHt-OwVqDRoLcpyMJ_rsv8HmG4PCezcstZNsiVwOORgtmzJQDKXOmBUJoeai8pA0zU6VqHUZSFIpEmJP-8z4ViwtfCE7cViVjaGwTVzibX5xEhcOLJA4RutA0yC8hO9YHai1nx-qxc-PfJ4KucX0Mnhwn5zg2DytkI0v9wqNFglPsJ0Y',
      bio: '活泼好动，喜欢玩飞盘和游泳',
      createdAt: '2024-01-15'
    }
  ])
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

  const actionSheetOptions = [
    { name: '查看成长轨迹', value: 'timeline' },
    { name: '编辑宠物信息', value: 'edit' },
    { name: '添加成长照片', value: 'photo' }
  ]

  useEffect(() => {
    // 从本地存储加载宠物数据
    const loadPets = async () => {
      try {
        const storedPets = await Taro.getStorage({ key: 'pets' })
        if (storedPets.data && Array.isArray(storedPets.data)) {
          setPets(storedPets.data)
        }
      } catch (error) {
        console.log('No stored pets found')
      }
    }
    
    loadPets()
  }, [])

  const handleAddPet = () => {
    Taro.navigateTo({
      url: '/pages/addPet/index'
    })
  }

  const handlePetDetail = (pet: Pet) => {
    setSelectedPet(pet)
    setShowActionSheet(true)
  }

  const handleActionSheetSelect = (item: any) => {
    if (!selectedPet) return
    
    setShowActionSheet(false)
    
    switch (item.value) {
      case 'timeline':
        // 查看成长轨迹
        Taro.navigateTo({
          url: `/pages/growthTimeline/index?petId=${selectedPet.id}`
        })
        break
      case 'edit':
        // 编辑宠物信息
        handleEditPet(selectedPet.id)
        break
      case 'photo':
        // 添加成长照片
        Taro.navigateTo({
          url: `/pages/addGrowthPhoto/index?petId=${selectedPet.id}`
        })
        break
    }
  }

  const handleEditPet = (petId: string) => {
    Taro.navigateTo({
      url: `/pages/addPet/index?id=${petId}&mode=edit`
    })
  }

  const handleDeletePet = (petId: string) => {
    Taro.showModal({
      title: '删除宠物',
      content: '确定要删除这个宠物信息吗？',
      success: async (res) => {
        if (res.confirm) {
          const newPets = pets.filter(pet => pet.id !== petId)
          setPets(newPets)
          
          // 保存到本地存储
          try {
            await Taro.setStorage({
              key: 'pets',
              data: newPets
            })
            Taro.showToast({
              title: '删除成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('Failed to save pets:', error)
          }
        }
      }
    })
  }

  const getSizeText = (size: string) => {
    const sizeMap = {
      small: '小型',
      medium: '中型',
      large: '大型'
    }
    return sizeMap[size] || size
  }

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? '♂️' : '♀️'
  }

  return (
    <BasePage title="我的爱宠" safeArea={true} className="bg-gray-50">
      <View className="relative min-h-screen">
        <ScrollView className="h-screen px-4 pb-25" scrollY>
          {pets.length === 0 ? (
            // 空状态
            <View className="flex flex-col items-center justify-center min-h-60vh text-center">
              <View className="text-6xl mb-6 opacity-60">🐕</View>
              <Text className="text-lg font-bold text-gray-900 mb-2 block">
                还没有添加宠物
              </Text>
              <Text className="text-sm text-gray-500 leading-relaxed max-w-60 block">
                点击右下角按钮添加你的第一个爱宠吧
              </Text>
            </View>
          ) : (
            // 宠物列表
            <View className="flex flex-col gap-4">
              {pets.map((pet) => (
                <Card 
                  key={pet.id} 
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 active:scale-98 transition-all cursor-pointer"
                  onClick={() => handlePetDetail(pet)}
                >
                  <View className="flex gap-4">
                    {/* 宠物头像 */}
                    <View className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                      {pet.photo ? (
                        <Image 
                          className="w-full h-full"
                          src={pet.photo}
                          mode="aspectFill"
                        />
                      ) : (
                        <View className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Text className="text-2xl opacity-60 block">🐕</Text>
                        </View>
                      )}
                    </View>

                    {/* 宠物信息 */}
                    <View className="flex-1 flex flex-col gap-2">
                      <View className="flex justify-between items-start">
                        <Text className="text-lg font-bold text-gray-900 leading-tight block">
                          {pet.name}
                        </Text>
                        <View className="flex gap-2">
                          <View 
                            className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center active:bg-blue-200 active:scale-90 transition-all cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditPet(pet.id)
                            }}
                          >
                            <Text className="text-sm block">✏️</Text>
                          </View>
                          <View 
                            className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center active:bg-red-200 active:scale-90 transition-all cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePet(pet.id)
                            }}
                          >
                            <Text className="text-sm block">🗑️</Text>
                          </View>
                        </View>
                      </View>
                      
                      <View className="flex flex-col gap-1">
                        <View className="flex items-center">
                          <Text className="text-sm text-gray-500 font-medium min-w-10 block">品种：</Text>
                          <Text className="text-sm text-gray-900 font-semibold block">{pet.breed}</Text>
                        </View>
                        <View className="flex gap-4">
                          <View className="flex items-center flex-1">
                            <Text className="text-sm text-gray-500 font-medium min-w-10 block">年龄：</Text>
                            <Text className="text-sm text-gray-900 font-semibold block">{pet.age}岁</Text>
                          </View>
                          <View className="flex items-center flex-1">
                            <Text className="text-sm text-gray-500 font-medium min-w-10 block">性别：</Text>
                            <Text className="text-sm text-gray-900 font-semibold block">{getGenderIcon(pet.gender)}</Text>
                          </View>
                          <View className="flex items-center flex-1">
                            <Text className="text-sm text-gray-500 font-medium min-w-10 block">体型：</Text>
                            <Text className="text-sm text-gray-900 font-semibold block">{getSizeText(pet.size)}</Text>
                          </View>
                        </View>
                      </View>

                      {pet.bio && (
                        <View className="mt-1">
                          <Text className="text-sm text-gray-500 leading-relaxed bg-gray-50 px-3 py-2 rounded-lg border-l-3 border-primary-500 block">
                            {pet.bio}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>

        {/* 悬浮添加按钮 */}
        <View 
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30 z-10 active:scale-90 transition-all cursor-pointer"
          onClick={handleAddPet}
        >
          <Text className="text-2xl font-light text-white leading-none block">+</Text>
        </View>

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

export default Pets