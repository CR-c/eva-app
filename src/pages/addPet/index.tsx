import { useState, useEffect } from 'react'
import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components'
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

interface PetForm {
  name: string
  breed: string
  age: string
  gender: 'male' | 'female'
  size: 'small' | 'medium' | 'large'
  photo?: string
  bio: string
}

function AddPet() {
  const [form, setForm] = useState<PetForm>({
    name: '',
    breed: '',
    age: '',
    gender: 'male',
    size: 'medium',
    photo: '',
    bio: ''
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState('')

  useEffect(() => {
    // 检查是否是编辑模式
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    
    if (params?.mode === 'edit' && params?.id) {
      setIsEditing(true)
      setEditingId(params.id)
      loadPetData(params.id)
    }
  }, [])

  const loadPetData = async (petId: string) => {
    try {
      const storedPets = await Taro.getStorage({ key: 'pets' })
      if (storedPets.data && Array.isArray(storedPets.data)) {
        const pets = storedPets.data as Pet[]
        const pet = pets.find(p => p.id === petId)
        if (pet) {
          setForm({
            name: pet.name,
            breed: pet.breed,
            age: pet.age.toString(),
            gender: pet.gender,
            size: pet.size,
            photo: pet.photo || '',
            bio: pet.bio || ''
          })
        }
      }
    } catch (error) {
      console.error('Failed to load pet data:', error)
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
        setForm(prev => ({ ...prev, photo: tempFilePath }))
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

  const handleInputChange = (field: keyof PetForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setForm(prev => ({ ...prev, gender }))
  }

  const handleSizeSelect = (size: 'small' | 'medium' | 'large') => {
    setForm(prev => ({ ...prev, size }))
  }

  const validateForm = () => {
    if (!form.name.trim()) {
      Taro.showToast({
        title: '请输入宠物名称',
        icon: 'none'
      })
      return false
    }
    
    if (!form.breed.trim()) {
      Taro.showToast({
        title: '请选择宠物品种',
        icon: 'none'
      })
      return false
    }
    
    if (!form.age.trim() || parseInt(form.age) < 0) {
      Taro.showToast({
        title: '请输入有效的年龄',
        icon: 'none'
      })
      return false
    }
    
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      // 获取现有宠物数据
      let pets: Pet[] = []
      try {
        const storedPets = await Taro.getStorage({ key: 'pets' })
        if (storedPets.data && Array.isArray(storedPets.data)) {
          pets = storedPets.data as Pet[]
        }
      } catch (error) {
        console.log('No existing pets found')
      }

      const petData: Pet = {
        id: isEditing ? editingId : Date.now().toString(),
        name: form.name.trim(),
        breed: form.breed.trim(),
        age: parseInt(form.age),
        gender: form.gender,
        size: form.size,
        photo: form.photo,
        bio: form.bio.trim(),
        createdAt: isEditing ? pets.find(p => p.id === editingId)?.createdAt || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }

      if (isEditing) {
        // 更新现有宠物
        const index = pets.findIndex(p => p.id === editingId)
        if (index !== -1) {
          pets[index] = petData
        }
      } else {
        // 添加新宠物
        pets.push(petData)
      }

      // 保存到本地存储
      await Taro.setStorage({
        key: 'pets',
        data: pets
      })

      Taro.showToast({
        title: isEditing ? '更新成功' : '添加成功',
        icon: 'success'
      })

      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('Failed to save pet:', error)
      Taro.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  }

  const breeds = [
    { value: 'golden', label: '金毛寻回犬' },
    { value: 'lab', label: '拉布拉多' },
    { value: 'poodle', label: '贵宾犬' },
    { value: 'bulldog', label: '法国斗牛犬' },
    { value: 'beagle', label: '比格犬' },
    { value: 'mixed', label: '混血犬' }
  ]

  return (
    <View className="add-pet-page">
      {/* 顶部导航栏 */}
      <View className="top-bar">
        <View className="nav-button" onClick={handleBack}>
          <Text className="nav-icon">←</Text>
        </View>
        <Text className="nav-title">{isEditing ? '编辑宠物' : '添加新宠物'}</Text>
        <View className="nav-placeholder" />
      </View>

      <View className="form-content">
        {/* 照片上传器 */}
        <View className="photo-uploader">
          <View className="upload-area" onClick={handlePhotoUpload}>
            {form.photo ? (
              <Image 
                className="uploaded-photo"
                src={form.photo}
                mode="aspectFill"
              />
            ) : (
              <View className="upload-placeholder">
                <Text className="upload-icon">📷</Text>
                <Text className="upload-text">上传照片</Text>
              </View>
            )}
            <View className="edit-badge">
              <Text className="edit-icon">✏️</Text>
            </View>
          </View>
          <Text className="upload-hint">点击添加宠物照片</Text>
        </View>

        {/* 表单字段 */}
        <View className="form-fields">
          {/* 宠物名称 */}
          <View className="form-group">
            <Text className="form-label">宠物名称</Text>
            <Input
              className="form-input"
              placeholder="例如：小白"
              value={form.name}
              onInput={(e) => handleInputChange('name', e.detail.value)}
            />
          </View>

          {/* 品种选择 */}
          <View className="form-group">
            <Text className="form-label">品种</Text>
            <View className="breed-selector">
              {breeds.map((breed) => (
                <View
                  key={breed.value}
                  className={`breed-option ${form.breed === breed.value ? 'selected' : ''}`}
                  onClick={() => handleInputChange('breed', breed.value)}
                >
                  <Text className="breed-text">{breed.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 年龄和性别 */}
          <View className="form-row">
            <View className="form-group flex-1">
              <Text className="form-label">年龄（岁）</Text>
              <Input
                className="form-input"
                placeholder="0"
                type="number"
                value={form.age}
                onInput={(e) => handleInputChange('age', e.detail.value)}
              />
            </View>

            <View className="form-group flex-1">
              <Text className="form-label">性别</Text>
              <View className="gender-selector">
                <View
                  className={`gender-option ${form.gender === 'male' ? 'selected' : ''}`}
                  onClick={() => handleGenderSelect('male')}
                >
                  <Text className="gender-icon">♂️</Text>
                  <Text className="gender-text">公</Text>
                </View>
                <View
                  className={`gender-option ${form.gender === 'female' ? 'selected' : ''}`}
                  onClick={() => handleGenderSelect('female')}
                >
                  <Text className="gender-icon">♀️</Text>
                  <Text className="gender-text">母</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 体型选择 */}
          <View className="form-group">
            <Text className="form-label">体型</Text>
            <View className="size-selector">
              <View
                className={`size-option ${form.size === 'small' ? 'selected' : ''}`}
                onClick={() => handleSizeSelect('small')}
              >
                <Text className="size-text">小型</Text>
              </View>
              <View
                className={`size-option ${form.size === 'medium' ? 'selected' : ''}`}
                onClick={() => handleSizeSelect('medium')}
              >
                <Text className="size-text">中型</Text>
              </View>
              <View
                className={`size-option ${form.size === 'large' ? 'selected' : ''}`}
                onClick={() => handleSizeSelect('large')}
              >
                <Text className="size-text">大型</Text>
              </View>
            </View>
          </View>

          {/* 宠物简介 */}
          <View className="form-group">
            <Text className="form-label">关于宠物 <Text className="optional">（可选）</Text></Text>
            <Textarea
              className="form-textarea"
              placeholder="任何特殊习惯、喜欢的玩具或医疗需求？"
              value={form.bio}
              onInput={(e) => handleInputChange('bio', e.detail.value)}
            />
          </View>
        </View>
      </View>

      {/* 底部保存按钮 */}
      <View className="bottom-button">
        <Button className="save-button" onClick={handleSave}>
          <Text className="save-icon">💾</Text>
          <Text className="save-text">{isEditing ? '更新宠物资料' : '保存宠物资料'}</Text>
        </Button>
      </View>
    </View>
  )
}

export default AddPet