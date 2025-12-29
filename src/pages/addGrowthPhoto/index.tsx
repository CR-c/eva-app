import { useState, useEffect } from 'react'
import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

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
  const [petId, setPetId] = useState('')
  const [petName, setPetName] = useState('')
  const [photo, setPhoto] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [ageInMonths, setAgeInMonths] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 获取路由参数
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    
    if (params?.petId) {
      setPetId(params.petId)
      loadPetInfo(params.petId)
    }

    // 设置默认日期为今天
    const today = new Date()
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    setDate(formattedDate)
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
        Taro.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  }

  const handleDatePicker = () => {
    Taro.showModal({
      title: '提示',
      content: '日期选择功能需要在真实环境中实现',
      showCancel: false
    })
  }

  const handleSave = async () => {
    if (!photo) {
      Taro.showToast({
        title: '请选择照片',
        icon: 'none'
      })
      return
    }

    if (!date) {
      Taro.showToast({
        title: '请选择日期',
        icon: 'none'
      })
      return
    }

    setLoading(true)
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
        date,
        notes: notes.trim(),
        ageInMonths,
        tags: [], // 可以后续扩展标签功能
        createdAt: new Date().toISOString()
      }

      growthPhotos.push(newPhoto)

      // 保存到本地存储
      await Taro.setStorage({
        key: 'growthPhotos',
        data: growthPhotos
      })

      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 延迟返回
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('Failed to save growth photo:', error)
      Taro.showToast({
        title: '保存失败',
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <View className="add-growth-photo">
      {/* 顶部导航栏 */}
      <View className="top-bar">
        <View className="nav-button" onClick={handleBack}>
          <Text className="nav-icon">✕</Text>
        </View>
        <Text className="nav-title">新增成长记录</Text>
        <View className="nav-save" onClick={handleSave}>
          <Text className="save-text">保存</Text>
        </View>
      </View>

      <View className="content">
        {/* 宠物信息提示 */}
        {petName && (
          <View className="pet-info-banner">
            <Text className="pet-icon">🐕</Text>
            <Text className="pet-info-text">{petName} 现在 {Math.floor(ageInMonths / 12)} 岁 {ageInMonths % 12} 个月了！</Text>
          </View>
        )}

        {/* 照片上传区域 */}
        <View className="photo-upload-section">
          <View className="upload-area" onClick={handlePhotoUpload}>
            {photo ? (
              <Image 
                className="uploaded-image"
                src={photo}
                mode="aspectFill"
              />
            ) : (
              <View className="upload-placeholder">
                <View className="upload-icon-circle">
                  <Text className="upload-icon">📷</Text>
                </View>
                <View className="upload-text-section">
                  <Text className="upload-title">添加照片</Text>
                  <Text className="upload-subtitle">点击这里上传你的宠物照片</Text>
                </View>
                <View className="upload-button">
                  <Text className="button-text">选择照片</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 表单字段 */}
        <View className="form-fields">
          {/* 拍摄日期 */}
          <View className="form-group">
            <Text className="form-label">拍摄日期</Text>
            <View className="date-input" onClick={handleDatePicker}>
              <Input
                className="date-field"
                value={formatDate(date)}
                disabled
                placeholder="选择日期"
              />
              <Text className="date-icon">📅</Text>
            </View>
          </View>

          {/* 备注 */}
          <View className="form-group">
            <Text className="form-label">备注</Text>
            <Textarea
              className="notes-textarea"
              placeholder="记录体重、身高或者可爱的瞬间..."
              value={notes}
              onInput={(e) => setNotes(e.detail.value)}
            />
          </View>
        </View>
      </View>

      {/* 底部保存按钮 */}
      <View className="bottom-save-section">
        <Button 
          className="save-timeline-button" 
          loading={loading}
          onClick={handleSave}
        >
          <Text className="save-button-text">保存到时间线</Text>
        </Button>
      </View>
    </View>
  )
}

export default AddGrowthPhoto