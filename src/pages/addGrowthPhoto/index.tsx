import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Button, TextArea, DatePicker } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
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

function AddGrowthPhoto() {
  const navBarInfo = getNavBarInfo()
  const [petId, setPetId] = useState('')
  const [petName, setPetName] = useState('')
  const [photo, setPhoto] = useState('')
  const [ageInMonths, setAgeInMonths] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 表单数据
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [notes, setNotes] = useState('')
  const [datePickerVisible, setDatePickerVisible] = useState(false)

  useEffect(() => {
    // 获取路由参数
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params

    if (params?.petId) {
      setPetId(params.petId)
      loadPetInfo(params.petId)
    }

    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const loadPetInfo = async (id: string) => {
    try {
      const storedPets = await Taro.getStorage({ key: 'pets' })
      if (storedPets.data && Array.isArray(storedPets.data)) {
        const pet = storedPets.data.find(p => p.id === id)
        if (pet) {
          setPetName(pet.name)
          // 计算宠物年龄（月数）
          const birthDate = new Date(pet.createdAt)
          const currentDate = new Date()
          const months = (currentDate.getFullYear() - birthDate.getFullYear()) * 12 +
            (currentDate.getMonth() - birthDate.getMonth())
          setAgeInMonths(Math.max(0, months))
        }
      }
    } catch (error) {
      console.error('Failed to load pet info:', error)
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handlePhotoUpload = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        setPhoto(tempFilePath)
      },
      fail: (error) => {
        console.error('Failed to choose image:', error)
        Taro.showToast({ title: '选择图片失败', icon: 'none' })
      }
    })
  }

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    if (!photo) {
      Taro.showToast({ title: '请选择照片', icon: 'none' })
      return
    }

    setSaving(true)

    try {
      // 获取现有成长记录
      let growthPhotos: GrowthPhoto[] = []
      try {
        const storedPhotos = await Taro.getStorage({ key: 'growthPhotos' })
        if (storedPhotos.data && Array.isArray(storedPhotos.data)) {
          growthPhotos = storedPhotos.data
        }
      } catch (error) {
        console.log('No existing growth photos found')
      }

      const newPhoto: GrowthPhoto = {
        id: Date.now().toString(),
        petId,
        photo,
        date: formatDate(selectedDate),
        notes: notes.trim(),
        ageInMonths,
        tags: [],
        createdAt: new Date().toISOString()
      }

      growthPhotos.push(newPhoto)

      await Taro.setStorage({
        key: 'growthPhotos',
        data: growthPhotos
      })

      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('Failed to save growth photo:', error)
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' })
    } finally {
      setSaving(false)
    }
  }

  const getAgeText = () => {
    const years = Math.floor(ageInMonths / 12)
    const months = ageInMonths % 12

    if (years === 0) {
      return `${months}个月`
    } else if (months === 0) {
      return `${years}岁`
    } else {
      return `${years}岁${months}个月`
    }
  }

  if (loading) {
    return (
      <View className="min-h-screen bg-[#f5f7f8]">
        {/* 自定义导航栏 */}
        <View
          className="bg-white"
          style={{
            paddingTop: `${navBarInfo.statusBarHeight}px`,
            borderBottom: '2rpx solid #f1f5f9'
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
              className="flex items-center justify-center bg-[#f1f5f9]"
              style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx' }}
              onClick={handleBack}
            >
              <Text style={{ fontSize: '32rpx', color: '#0d171c' }}>←</Text>
            </View>
            <Text className="font-bold text-[#0d171c]" style={{ fontSize: '32rpx' }}>
              新增成长记录
            </Text>
            <View style={{ width: '72rpx' }} />
          </View>
        </View>

        {/* 加载骨架屏 */}
        <View style={{ padding: '48rpx 32rpx' }}>
          {/* 宠物信息骨架 */}
          <View
            className="bg-[#e2e8f0]"
            style={{
              height: '80rpx',
              borderRadius: '40rpx',
              marginBottom: '48rpx',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
          {/* 照片上传骨架 */}
          <View
            className="bg-[#e2e8f0]"
            style={{
              height: '400rpx',
              borderRadius: '24rpx',
              marginBottom: '48rpx'
            }}
          />
          {/* 表单骨架 */}
          {[1, 2].map(i => (
            <View
              key={i}
              className="bg-[#e2e8f0]"
              style={{
                height: '120rpx',
                borderRadius: '24rpx',
                marginBottom: '24rpx'
              }}
            />
          ))}
        </View>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-[#f5f7f8]">
      {/* 自定义导航栏 */}
      <View
        className="bg-white"
        style={{
          paddingTop: `${navBarInfo.statusBarHeight}px`,
          borderBottom: '2rpx solid #f1f5f9',
          position: 'sticky',
          top: 0,
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
            className="flex items-center justify-center bg-[#f1f5f9]"
            style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx' }}
            onClick={handleBack}
          >
            <Text style={{ fontSize: '32rpx', color: '#0d171c' }}>←</Text>
          </View>
          <Text className="font-bold text-[#0d171c]" style={{ fontSize: '32rpx' }}>
            新增成长记录
          </Text>
          <View style={{ width: '72rpx' }} />
        </View>
      </View>

      <ScrollView scrollY style={{ height: `calc(100vh - ${navBarInfo.totalHeight}px)` }}>
        <View style={{ padding: '32rpx', paddingBottom: '200rpx' }}>
          {/* 宠物信息提示 */}
          {petName && (
            <View
              className="flex items-center justify-center"
              style={{
                gap: '16rpx',
                padding: '24rpx 32rpx',
                background: 'rgba(37, 175, 244, 0.1)',
                borderRadius: '48rpx',
                marginBottom: '32rpx'
              }}
            >
              <Text style={{ fontSize: '32rpx' }}>🐕</Text>
              <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#25aff4' }}>
                {petName} 现在 {getAgeText()}了！
              </Text>
            </View>
          )}

          {/* 照片上传区域 */}
          <View
            className="bg-white"
            style={{
              borderRadius: '24rpx',
              padding: '32rpx',
              marginBottom: '32rpx',
              boxShadow: '0 4rpx 24rpx rgba(0,0,0,0.06)'
            }}
          >
            <View className="flex items-center" style={{ marginBottom: '24rpx' }}>
              <View
                style={{
                  width: '8rpx',
                  height: '32rpx',
                  background: 'linear-gradient(135deg, #25aff4 0%, #1e40af 100%)',
                  borderRadius: '4rpx',
                  marginRight: '16rpx'
                }}
              />
              <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>成长照片</Text>
            </View>

            <View
              style={{
                width: '100%',
                minHeight: '400rpx',
                borderRadius: '20rpx',
                border: photo ? '4rpx solid #25aff4' : '4rpx dashed #cee0e8',
                background: photo ? 'transparent' : '#ffffff',
                overflow: 'hidden'
              }}
              onClick={handlePhotoUpload}
            >
              {photo ? (
                <Image
                  src={photo}
                  mode="aspectFill"
                  style={{
                    width: '100%',
                    height: '400rpx'
                  }}
                />
              ) : (
                <View
                  className="flex flex-col items-center justify-center"
                  style={{ minHeight: '400rpx', padding: '48rpx' }}
                >
                  <View
                    className="flex items-center justify-center"
                    style={{
                      width: '128rpx',
                      height: '128rpx',
                      borderRadius: '64rpx',
                      background: 'rgba(37, 175, 244, 0.1)',
                      marginBottom: '32rpx',
                      boxShadow: '0 4rpx 16rpx rgba(37, 175, 244, 0.2)'
                    }}
                  >
                    <Text style={{ fontSize: '48rpx', color: '#25aff4' }}>📷</Text>
                  </View>
                  <Text style={{ fontSize: '32rpx', fontWeight: '700', color: '#0d171c', marginBottom: '8rpx' }}>
                    添加照片
                  </Text>
                  <Text style={{ fontSize: '26rpx', color: '#64748b', textAlign: 'center', marginBottom: '24rpx' }}>
                    点击这里上传你的宠物照片
                  </Text>
                  <View
                    style={{
                      padding: '16rpx 48rpx',
                      background: '#f5f7f8',
                      border: '2rpx solid #cee0e8',
                      borderRadius: '24rpx'
                    }}
                  >
                    <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>
                      选择照片
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* 拍摄日期 */}
          <View
            className="bg-white"
            style={{
              borderRadius: '24rpx',
              padding: '32rpx',
              marginBottom: '24rpx',
              boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.04)'
            }}
          >
            <View className="flex items-center" style={{ marginBottom: '16rpx' }}>
              <View
                style={{
                  width: '8rpx',
                  height: '32rpx',
                  background: 'linear-gradient(135deg, #25aff4 0%, #1e40af 100%)',
                  borderRadius: '4rpx',
                  marginRight: '16rpx'
                }}
              />
              <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>拍摄日期</Text>
            </View>
            <View
              className="flex items-center justify-between"
              style={{
                height: '88rpx',
                background: '#f8fafc',
                border: '2rpx solid #e2e8f0',
                borderRadius: '20rpx',
                padding: '0 24rpx'
              }}
              onClick={() => setDatePickerVisible(true)}
            >
              <Text style={{ fontSize: '28rpx', color: '#0d171c' }}>
                {formatDate(selectedDate)}
              </Text>
              <Text style={{ fontSize: '32rpx', color: '#25aff4' }}>📅</Text>
            </View>
            <DatePicker
              visible={datePickerVisible}
              defaultValue={selectedDate}
              onClose={() => setDatePickerVisible(false)}
              onConfirm={(_, values) => {
                if (values && values.length >= 3) {
                  const newDate = new Date(
                    parseInt(values[0]),
                    parseInt(values[1]) - 1,
                    parseInt(values[2])
                  )
                  setSelectedDate(newDate)
                }
                setDatePickerVisible(false)
              }}
            />
          </View>

          {/* 备注 */}
          <View
            className="bg-white"
            style={{
              borderRadius: '24rpx',
              padding: '32rpx',
              marginBottom: '24rpx',
              boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.04)'
            }}
          >
            <View className="flex items-center" style={{ marginBottom: '16rpx' }}>
              <View
                style={{
                  width: '8rpx',
                  height: '32rpx',
                  background: 'linear-gradient(135deg, #25aff4 0%, #1e40af 100%)',
                  borderRadius: '4rpx',
                  marginRight: '16rpx'
                }}
              />
              <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>备注</Text>
              <Text style={{ fontSize: '24rpx', color: '#94a3b8', marginLeft: '8rpx' }}>（可选）</Text>
            </View>
            <TextArea
              value={notes}
              onChange={(val) => setNotes(val)}
              placeholder="记录体重、身高或者可爱的瞬间..."
              maxLength={300}
              style={{
                '--nutui-textarea-padding': '24rpx',
                '--nutui-textarea-font-size': '28rpx',
                width: '100%',
                minHeight: '200rpx',
                background: '#f8fafc',
                border: '2rpx solid #e2e8f0',
                borderRadius: '20rpx'
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* 底部保存按钮 */}
      <View
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '32rpx',
          paddingBottom: '64rpx',
          background: 'linear-gradient(to top, #f5f7f8 0%, #f5f7f8 70%, transparent 100%)',
          zIndex: 100
        }}
      >
        <Button
          type="primary"
          disabled={saving}
          onClick={handleSubmit}
          style={{
            width: '100%',
            height: '100rpx',
            background: saving ? '#94a3b8' : '#25aff4',
            borderRadius: '50rpx',
            border: 'none',
            boxShadow: '0 16rpx 40rpx rgba(37,175,244,0.35)'
          }}
        >
          <Text style={{ fontSize: '30rpx', fontWeight: '700', color: 'white' }}>
            {saving ? '保存中...' : '保存到时间线'}
          </Text>
        </Button>
      </View>
    </View>
  )
}

export default AddGrowthPhoto
