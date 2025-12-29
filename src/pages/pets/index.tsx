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
    Taro.showToast({
      title: `查看${pet.name}的详情`,
      icon: 'none'
    })
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
    <View className="pets-page">
      <ScrollView className="pets-content" scrollY>
        {pets.length === 0 ? (
          // 空状态
          <View className="empty-state">
            <View className="empty-icon">🐕</View>
            <Text className="empty-title">还没有添加宠物</Text>
            <Text className="empty-subtitle">点击右下角按钮添加你的第一个爱宠吧</Text>
          </View>
        ) : (
          // 宠物列表
          <View className="pets-list">
            {pets.map((pet) => (
              <View key={pet.id} className="pet-card" onClick={() => handlePetDetail(pet)}>
                {/* 宠物头像 */}
                <View className="pet-avatar">
                  {pet.photo ? (
                    <Image 
                      className="avatar-image"
                      src={pet.photo}
                      mode="aspectFill"
                    />
                  ) : (
                    <View className="avatar-placeholder">
                      <Text className="placeholder-icon">🐕</Text>
                    </View>
                  )}
                </View>

                {/* 宠物信息 */}
                <View className="pet-info">
                  <View className="pet-header">
                    <Text className="pet-name">{pet.name}</Text>
                    <View className="pet-actions">
                      <View 
                        className="action-button edit-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditPet(pet.id)
                        }}
                      >
                        <Text className="action-icon">✏️</Text>
                      </View>
                      <View 
                        className="action-button delete-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePet(pet.id)
                        }}
                      >
                        <Text className="action-icon">🗑️</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View className="pet-details">
                    <View className="detail-item">
                      <Text className="detail-label">品种：</Text>
                      <Text className="detail-value">{pet.breed}</Text>
                    </View>
                    <View className="detail-row">
                      <View className="detail-item">
                        <Text className="detail-label">年龄：</Text>
                        <Text className="detail-value">{pet.age}岁</Text>
                      </View>
                      <View className="detail-item">
                        <Text className="detail-label">性别：</Text>
                        <Text className="detail-value">{getGenderIcon(pet.gender)}</Text>
                      </View>
                      <View className="detail-item">
                        <Text className="detail-label">体型：</Text>
                        <Text className="detail-value">{getSizeText(pet.size)}</Text>
                      </View>
                    </View>
                  </View>

                  {pet.bio && (
                    <View className="pet-bio">
                      <Text className="bio-text">{pet.bio}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 悬浮添加按钮 */}
      <View className="floating-add-button" onClick={handleAddPet}>
        <Text className="add-icon">+</Text>
      </View>
    </View>
  )
}

export default Pets