import { useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import Taro, { useDidShow } from '@tarojs/taro'
import { usePetStore } from '@/store/pet'
import { deletePet } from '@/services/pet'
import type { PetVO, PetSize } from '@/constants/types'

const SIZE_MAP: Record<PetSize, string> = {
  small: '小型',
  medium: '中型',
  large: '大型',
}

function Pets() {
  const { pets, loading, fetchPets, removePet } = usePetStore()

  // 页面显示时刷新数据
  useDidShow(() => {
    fetchPets()
  })

  useEffect(() => {
    fetchPets()
  }, [])

  const handleAddPet = () => {
    Taro.navigateTo({ url: '/pages/addPet/index' })
  }

  const handlePetDetail = (pet: PetVO) => {
    Taro.showActionSheet({
      itemList: ['查看成长轨迹', '编辑宠物信息', '添加成长照片', '成长记录'],
      success: res => {
        switch (res.tapIndex) {
          case 0:
            Taro.navigateTo({ url: `/pages/growthTimeline/index?petId=${pet.id}` })
            break
          case 1:
            Taro.navigateTo({ url: `/pages/addPet/index?id=${pet.id}&mode=edit` })
            break
          case 2:
            Taro.navigateTo({ url: `/pages/addGrowthPhoto/index?petId=${pet.id}` })
            break
          case 3:
            Taro.navigateTo({ url: `/pages/growthRecords/index?petId=${pet.id}` })
            break
        }
      },
    })
  }

  const handleDeletePet = (e: any, petId: number) => {
    e.stopPropagation()
    Taro.showModal({
      title: '删除宠物',
      content: '确定要删除这个宠物信息吗？删除后相关的成长照片和记录也将被删除。',
      success: async res => {
        if (res.confirm) {
          try {
            await deletePet(petId)
            removePet(petId)
            Taro.showToast({ title: '删除成功', icon: 'success' })
          } catch (error) {
            console.error('Delete pet failed:', error)
          }
        }
      },
    })
  }

  const getSizeText = (size: PetSize) => {
    return SIZE_MAP[size] || size
  }

  return (
    <View className='min-h-screen bg-[#f5f7f8]'>
      {/* Header */}
      <View className='bg-white' style={{ padding: '48rpx 32rpx 32rpx' }}>
        <Text
          className='block font-bold text-[#0d171c]'
          style={{ fontSize: '40rpx', marginBottom: '8rpx' }}
        >
          我的爱宠
        </Text>
        <Text className='block text-[#64748b]' style={{ fontSize: '28rpx' }}>
          {pets.length > 0 ? `共 ${pets.length} 只宠物` : '添加你的第一只爱宠吧'}
        </Text>
      </View>

      {/* Content */}
      <View style={{ padding: '24rpx 32rpx 200rpx' }}>
        {loading && pets.length === 0 ? (
          /* Loading State */
          <View
            className='flex flex-col items-center justify-center'
            style={{ padding: '80rpx 40rpx' }}
          >
            <Text className='text-[#64748b]' style={{ fontSize: '28rpx' }}>
              加载中...
            </Text>
          </View>
        ) : pets.length === 0 ? (
          /* Empty State */
          <View
            className='flex flex-col items-center justify-center bg-white'
            style={{
              padding: '80rpx 40rpx',
              borderRadius: '32rpx',
              marginTop: '40rpx',
            }}
          >
            <Text style={{ fontSize: '120rpx', marginBottom: '32rpx' }}>🐕</Text>
            <Text
              className='block font-bold text-[#0d171c]'
              style={{ fontSize: '36rpx', marginBottom: '16rpx' }}
            >
              还没有添加宠物
            </Text>
            <Text
              className='block text-[#64748b] text-center'
              style={{ fontSize: '28rpx', lineHeight: '40rpx', maxWidth: '400rpx' }}
            >
              点击下方按钮添加你的第一个爱宠吧
            </Text>
            <Button
              type='primary'
              onClick={handleAddPet}
              style={{
                marginTop: '48rpx',
                height: '88rpx',
                borderRadius: '44rpx',
                background: '#25aff4',
                paddingLeft: '48rpx',
                paddingRight: '48rpx',
              }}
            >
              <Text className='text-white font-bold' style={{ fontSize: '30rpx' }}>
                + 添加宠物
              </Text>
            </Button>
          </View>
        ) : (
          /* Pet List */
          <View style={{ display: 'flex', flexDirection: 'column', gap: '24rpx' }}>
            {pets.map(pet => (
              <View
                key={pet.id}
                className='bg-white'
                style={{
                  borderRadius: '32rpx',
                  padding: '32rpx',
                  border: '2rpx solid #f1f5f9',
                }}
                onClick={() => handlePetDetail(pet)}
              >
                <View className='flex' style={{ gap: '24rpx' }}>
                  {/* Pet Avatar */}
                  <View
                    className='flex-shrink-0 overflow-hidden'
                    style={{
                      width: '160rpx',
                      height: '160rpx',
                      borderRadius: '24rpx',
                    }}
                  >
                    {pet.photo ? (
                      <Image
                        src={pet.photo}
                        mode='aspectFill'
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <View
                        className='flex items-center justify-center bg-[#f1f5f9]'
                        style={{ width: '100%', height: '100%' }}
                      >
                        <Text style={{ fontSize: '60rpx' }}>🐕</Text>
                      </View>
                    )}
                  </View>

                  {/* Pet Info */}
                  <View className='flex-1'>
                    <View
                      className='flex items-center justify-between'
                      style={{ marginBottom: '16rpx' }}
                    >
                      <View className='flex items-center' style={{ gap: '12rpx' }}>
                        <Text className='font-bold text-[#0d171c]' style={{ fontSize: '34rpx' }}>
                          {pet.name}
                        </Text>
                        <Text style={{ fontSize: '28rpx' }}>
                          {pet.gender === 'male' ? '♂️' : '♀️'}
                        </Text>
                      </View>
                      <View
                        className='flex items-center justify-center'
                        style={{
                          width: '56rpx',
                          height: '56rpx',
                          borderRadius: '28rpx',
                          background: '#fee2e2',
                        }}
                        onClick={e => handleDeletePet(e, pet.id)}
                      >
                        <Text style={{ fontSize: '24rpx' }}>🗑️</Text>
                      </View>
                    </View>

                    <Text
                      className='block text-[#64748b]'
                      style={{ fontSize: '26rpx', marginBottom: '12rpx' }}
                    >
                      {pet.breed}
                    </Text>

                    <View className='flex' style={{ gap: '24rpx' }}>
                      <View
                        className='flex items-center justify-center bg-[#eff6ff]'
                        style={{
                          padding: '8rpx 20rpx',
                          borderRadius: '20rpx',
                        }}
                      >
                        <Text className='text-[#25aff4]' style={{ fontSize: '24rpx' }}>
                          {pet.age}岁
                        </Text>
                      </View>
                      <View
                        className='flex items-center justify-center bg-[#f0fdf4]'
                        style={{
                          padding: '8rpx 20rpx',
                          borderRadius: '20rpx',
                        }}
                      >
                        <Text className='text-[#22c55e]' style={{ fontSize: '24rpx' }}>
                          {getSizeText(pet.size)}
                        </Text>
                      </View>
                      {pet.stats && (
                        <View
                          className='flex items-center justify-center bg-[#fef3c7]'
                          style={{
                            padding: '8rpx 20rpx',
                            borderRadius: '20rpx',
                          }}
                        >
                          <Text className='text-[#d97706]' style={{ fontSize: '24rpx' }}>
                            {pet.stats.photoCount}张照片
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {pet.bio && (
                  <View
                    className='bg-[#f8fafc]'
                    style={{
                      marginTop: '24rpx',
                      padding: '20rpx 24rpx',
                      borderRadius: '16rpx',
                      borderLeft: '6rpx solid #25aff4',
                    }}
                  >
                    <Text
                      className='text-[#64748b]'
                      style={{ fontSize: '26rpx', lineHeight: '38rpx' }}
                    >
                      {pet.bio}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Floating Add Button */}
      {pets.length > 0 && (
        <View
          className='fixed flex items-center justify-center'
          style={{
            bottom: '180rpx',
            right: '32rpx',
            width: '112rpx',
            height: '112rpx',
            borderRadius: '56rpx',
            background: 'linear-gradient(135deg, #25aff4, #1e9fe0)',
            boxShadow: '0 8rpx 24rpx rgba(37, 175, 244, 0.4)',
            zIndex: 100,
          }}
          onClick={handleAddPet}
        >
          <Text
            className='text-white font-light'
            style={{ fontSize: '56rpx', lineHeight: '56rpx' }}
          >
            +
          </Text>
        </View>
      )}
    </View>
  )
}

export default Pets
