import { useState, useEffect } from 'react'
import { View, Text, Input, Textarea, Button, Image, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Skeleton from '@/components/Skeleton'
import PageLayout from '@/components/PageLayout'
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  // 品种选项
  const breeds = [
    '金毛寻回犬',
    '拉布拉多',
    '贵宾犬',
    '法国斗牛犬',
    '比格犬',
    '边境牧羊犬',
    '哈士奇',
    '萨摩耶',
    '柯基',
    '泰迪',
    '混血犬',
    '其他'
  ]

  // 性别选项
  const genders = ['公', '母']
  
  // 体型选项
  const sizes = ['小型', '中型', '大型']

  useEffect(() => {
    // 模拟加载时间
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    // 检查是否是编辑模式
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    
    if (params?.mode === 'edit' && params?.id) {
      setIsEditing(true)
      setEditingId(params.id)
      loadPetData(params.id)
    }

    return () => clearTimeout(timer)
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

  // 品种选择
  const handleBreedChange = (e: any) => {
    const index = e.detail.value
    setForm(prev => ({ ...prev, breed: breeds[index] }))
  }

  // 性别选择
  const handleGenderChange = (e: any) => {
    const index = e.detail.value
    const gender = index === 0 ? 'male' : 'female'
    setForm(prev => ({ ...prev, gender }))
  }

  // 体型选择
  const handleSizeChange = (e: any) => {
    const index = e.detail.value
    const sizeMap = ['small', 'medium', 'large'] as const
    setForm(prev => ({ ...prev, size: sizeMap[index] }))
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

    setSaving(true)
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
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout title={isEditing ? '编辑宠物' : '添加新宠物'}>
      <View className="add-pet-content">
        {loading ? (
          <View className="loading-container">
            {/* 照片上传骨架屏 */}
            <View className="photo-skeleton">
              <View className="skeleton-avatar"></View>
              <View className="skeleton-text"></View>
            </View>
            
            {/* 表单字段骨架屏 */}
            <View className="form-skeleton">
              <Skeleton card rows={2} />
              <Skeleton card rows={1} />
              <Skeleton card rows={2} />
              <Skeleton card rows={1} />
              <Skeleton card rows={3} />
            </View>
          </View>
        ) : (
          <>
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
                <View className="picker-container">
                  <Picker
                    mode="selector"
                    range={breeds}
                    value={breeds.indexOf(form.breed)}
                    onChange={handleBreedChange}
                  >
                    <View className="picker-input">
                      <Text className={`picker-text ${!form.breed ? 'placeholder' : ''}`}>
                        {form.breed || '请选择品种'}
                      </Text>
                      <Text className="picker-arrow">▼</Text>
                    </View>
                  </Picker>
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
                  <View className="picker-container">
                    <Picker
                      mode="selector"
                      range={genders}
                      value={form.gender === 'male' ? 0 : 1}
                      onChange={handleGenderChange}
                    >
                      <View className="picker-input">
                        <Text className="picker-text">
                          {form.gender === 'male' ? '♂️ 公' : '♀️ 母'}
                        </Text>
                        <Text className="picker-arrow">▼</Text>
                      </View>
                    </Picker>
                  </View>
                </View>
              </View>

              {/* 体型选择 */}
              <View className="form-group">
                <Text className="form-label">体型</Text>
                <View className="picker-container">
                  <Picker
                    mode="selector"
                    range={sizes}
                    value={sizes.indexOf(form.size === 'small' ? '小型' : form.size === 'medium' ? '中型' : '大型')}
                    onChange={handleSizeChange}
                  >
                    <View className="picker-input">
                      <Text className="picker-text">
                        {form.size === 'small' ? '小型' : form.size === 'medium' ? '中型' : '大型'}
                      </Text>
                      <Text className="picker-arrow">▼</Text>
                    </View>
                  </Picker>
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
          </>
        )}

        {/* 底部保存按钮 */}
        <View className="bottom-button">
          <Button 
            className={`save-button ${saving ? 'saving' : ''}`} 
            onClick={handleSave}
            loading={saving}
            disabled={loading || saving}
          >
            <Text className="save-icon">💾</Text>
            <Text className="save-text">
              {saving ? '保存中...' : isEditing ? '更新宠物资料' : '保存宠物资料'}
            </Text>
          </Button>
        </View>
      </View>
    </PageLayout>
  )
}

export default AddPet