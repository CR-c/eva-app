import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Button, Input, TextArea, Picker } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { createPet, updatePet, getPetById, getBreedOptions, getSizeOptions, getGenderOptions } from '@/services/pet'
import type { PetDTO, PetGender, PetSize, OptionItem } from '@/constants/types'
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

function AddPet() {
  const navBarInfo = getNavBarInfo()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')

  // 表单数据
  const [name, setName] = useState('')
  const [selectedBreed, setSelectedBreed] = useState('')
  const [age, setAge] = useState('')
  const [selectedGender, setSelectedGender] = useState<PetGender>('male')
  const [selectedSize, setSelectedSize] = useState<PetSize>('medium')
  const [bio, setBio] = useState('')
  const [birthDate, setBirthDate] = useState('')

  // Picker 状态
  const [breedPickerVisible, setBreedPickerVisible] = useState(false)
  const [genderPickerVisible, setGenderPickerVisible] = useState(false)
  const [sizePickerVisible, setSizePickerVisible] = useState(false)

  // 默认选项（初始化时使用，API加载后会覆盖）
  const defaultBreeds = [
    { label: '金毛寻回犬', value: '金毛寻回犬' },
    { label: '拉布拉多', value: '拉布拉多' },
    { label: '贵宾犬', value: '贵宾犬' },
    { label: '法国斗牛犬', value: '法国斗牛犬' },
    { label: '边境牧羊犬', value: '边境牧羊犬' },
    { label: '哈士奇', value: '哈士奇' },
    { label: '萨摩耶', value: '萨摩耶' },
    { label: '柯基', value: '柯基' },
    { label: '泰迪', value: '泰迪' },
    { label: '混血犬', value: '混血犬' },
    { label: '其他', value: '其他' }
  ]

  const defaultGenderOptions = [
    { label: '♂️ 公', value: 'male' },
    { label: '♀️ 母', value: 'female' }
  ]

  const defaultSizeOptions = [
    { label: '小型', value: 'small' },
    { label: '中型', value: 'medium' },
    { label: '大型', value: 'large' }
  ]

  // 选项列表（从API获取，初始使用默认值）
  const [breeds, setBreeds] = useState<{ label: string; value: string }[]>(defaultBreeds)
  const [genderOptions, setGenderOptions] = useState<{ label: string; value: string }[]>(defaultGenderOptions)
  const [sizeOptions, setSizeOptions] = useState<{ label: string; value: string }[]>(defaultSizeOptions)

  // 加载选项数据
  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    try {
      const [breedsData, gendersData, sizesData] = await Promise.all([
        getBreedOptions(),
        getGenderOptions(),
        getSizeOptions()
      ])

      // 转换为 Picker 需要的格式（使用 label 字段）
      setBreeds(breedsData.map((item: OptionItem) => ({
        label: item.label,
        value: item.value
      })))

      setGenderOptions(gendersData.map((item: OptionItem) => ({
        label: item.value === 'male' ? '♂️ ' + item.label : '♀️ ' + item.label,
        value: item.value
      })))

      setSizeOptions(sizesData.map((item: OptionItem) => ({
        label: item.label,
        value: item.value
      })))
    } catch (error) {
      console.error('Failed to load options:', error)
      // 加载失败时保持默认选项（已在初始化时设置）
    }
  }

  useEffect(() => {
    // 检查是否是编辑模式
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params

    if (params?.mode === 'edit' && params?.id) {
      setIsEditing(true)
      setEditingId(parseInt(params.id))
      loadPetData(parseInt(params.id))
    } else {
      setLoading(false)
    }
  }, [])

  const loadPetData = async (petId: number) => {
    try {
      const pet = await getPetById(petId)
      if (pet) {
        setName(pet.name)
        setSelectedBreed(pet.breed)
        setAge(pet.age.toString())
        setSelectedGender(pet.gender)
        setSelectedSize(pet.size)
        setBio(pet.bio || '')
        setPhotoUrl(pet.photo || '')
        setBirthDate(pet.birthDate || '')
      }
    } catch (error) {
      console.error('Failed to load pet data:', error)
      Taro.showToast({ title: '加载宠物信息失败', icon: 'none' })
    } finally {
      setLoading(false)
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
        // TODO: 实际项目中需要上传到服务器获取URL
        setPhotoUrl(tempFilePath)
      },
      fail: (error) => {
        console.error('Failed to choose image:', error)
        Taro.showToast({ title: '选择图片失败', icon: 'none' })
      }
    })
  }

  const handleSubmit = async () => {
    // 验证表单
    if (!name.trim()) {
      Taro.showToast({ title: '请输入宠物名称', icon: 'none' })
      return
    }
    if (!selectedBreed) {
      Taro.showToast({ title: '请选择宠物品种', icon: 'none' })
      return
    }
    if (!age || parseInt(age) < 0 || parseInt(age) > 30) {
      Taro.showToast({ title: '请输入有效年龄(0-30)', icon: 'none' })
      return
    }

    setSaving(true)

    try {
      const petData: PetDTO = {
        name: name.trim(),
        breed: selectedBreed,
        age: parseInt(age),
        gender: selectedGender,
        size: selectedSize,
        photo: photoUrl || undefined,
        bio: bio.trim() || undefined,
        birthDate: birthDate || undefined,
      }

      if (isEditing && editingId) {
        await updatePet(editingId, petData)
        Taro.showToast({ title: '更新成功', icon: 'success' })
      } else {
        await createPet(petData)
        Taro.showToast({ title: '保存成功', icon: 'success' })
      }

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('Failed to save pet:', error)
    } finally {
      setSaving(false)
    }
  }

  const getGenderText = () => {
    const option = genderOptions.find(g => g.value === selectedGender)
    return option ? option.label : '请选择性别'
  }

  const getSizeText = () => {
    const option = sizeOptions.find(s => s.value === selectedSize)
    return option ? option.label : '请选择体型'
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
              {isEditing ? '编辑宠物' : '添加新宠物'}
            </Text>
            <View style={{ width: '72rpx' }} />
          </View>
        </View>

        {/* 加载骨架屏 */}
        <View style={{ padding: '48rpx 32rpx' }}>
          {/* 照片骨架 */}
          <View className="flex flex-col items-center" style={{ marginBottom: '48rpx' }}>
            <View
              className="bg-[#e2e8f0]"
              style={{
                width: '256rpx',
                height: '256rpx',
                borderRadius: '128rpx',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
            <View
              className="bg-[#e2e8f0]"
              style={{
                width: '200rpx',
                height: '32rpx',
                borderRadius: '16rpx',
                marginTop: '24rpx'
              }}
            />
          </View>
          {/* 表单骨架 */}
          {[1, 2, 3, 4].map(i => (
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
            {isEditing ? '编辑宠物' : '添加新宠物'}
          </Text>
          <View style={{ width: '72rpx' }} />
        </View>
      </View>

      <ScrollView scrollY style={{ height: `calc(100vh - ${navBarInfo.totalHeight}px)` }}>
        <View style={{ padding: '32rpx', paddingBottom: '200rpx' }}>
          {/* 照片上传器 */}
          <View
            className="flex flex-col items-center bg-white"
            style={{
              padding: '48rpx',
              borderRadius: '32rpx',
              marginBottom: '32rpx',
              boxShadow: '0 4rpx 24rpx rgba(0,0,0,0.06)'
            }}
          >
            <View
              style={{
                width: '256rpx',
                height: '256rpx',
                borderRadius: '128rpx',
                position: 'relative'
              }}
              onClick={handlePhotoUpload}
            >
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  mode="aspectFill"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '128rpx',
                    border: '6rpx solid #25aff4'
                  }}
                />
              ) : (
                <View
                  className="flex flex-col items-center justify-center"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '128rpx',
                    border: '6rpx dashed #25aff4',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                  }}
                >
                  <Text style={{ fontSize: '48rpx', color: '#25aff4' }}>📷</Text>
                  <Text style={{ fontSize: '24rpx', fontWeight: '600', color: '#25aff4', marginTop: '12rpx' }}>
                    上传照片
                  </Text>
                </View>
              )}
              <View
                style={{
                  position: 'absolute',
                  bottom: '16rpx',
                  right: '16rpx',
                  width: '56rpx',
                  height: '56rpx',
                  background: 'linear-gradient(135deg, #25aff4 0%, #1e40af 100%)',
                  borderRadius: '28rpx',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '6rpx solid #ffffff',
                  boxShadow: '0 4rpx 16rpx rgba(37,175,244,0.3)'
                }}
              >
                <Text style={{ fontSize: '24rpx', color: 'white' }}>✏️</Text>
              </View>
            </View>
            <Text style={{ marginTop: '24rpx', fontSize: '26rpx', color: '#64748b' }}>
              点击添加宠物照片
            </Text>
          </View>

          {/* 宠物名称 */}
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
              <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>宠物名称</Text>
            </View>
            <Input
              value={name}
              onChange={(val) => setName(val)}
              placeholder="例如：小白"
              style={{
                '--nutui-input-padding': '0 24rpx',
                '--nutui-input-font-size': '28rpx',
                height: '88rpx',
                background: '#f8fafc',
                border: '2rpx solid #e2e8f0',
                borderRadius: '20rpx'
              }}
            />
          </View>

          {/* 品种选择 */}
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
              <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>品种</Text>
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
              onClick={() => setBreedPickerVisible(true)}
            >
              <Text style={{ fontSize: '28rpx', color: selectedBreed ? '#0d171c' : '#94a3b8' }}>
                {selectedBreed || '请选择品种'}
              </Text>
              <Text style={{ fontSize: '24rpx', color: '#64748b' }}>▼</Text>
            </View>
            <Picker
              title="请选择品种"
              visible={breedPickerVisible}
              options={[breeds]}
              onClose={() => setBreedPickerVisible(false)}
              onConfirm={(options, values) => {
                if (values && values.length > 0) {
                  setSelectedBreed(values[0] as string)
                }
                setBreedPickerVisible(false)
              }}
            />
          </View>

          {/* 年龄和性别 */}
          <View className="flex" style={{ gap: '24rpx', marginBottom: '24rpx' }}>
            <View
              className="flex-1 bg-white"
              style={{
                borderRadius: '24rpx',
                padding: '32rpx',
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
                <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>年龄（岁）</Text>
              </View>
              <Input
                type="number"
                value={age}
                onChange={(val) => setAge(val)}
                placeholder="0"
                style={{
                  '--nutui-input-padding': '0 24rpx',
                  '--nutui-input-font-size': '28rpx',
                  height: '88rpx',
                  background: '#f8fafc',
                  border: '2rpx solid #e2e8f0',
                  borderRadius: '20rpx'
                }}
              />
            </View>

            <View
              className="flex-1 bg-white"
              style={{
                borderRadius: '24rpx',
                padding: '32rpx',
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
                <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>性别</Text>
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
                onClick={() => setGenderPickerVisible(true)}
              >
                <Text style={{ fontSize: '28rpx', color: '#0d171c' }}>
                  {getGenderText()}
                </Text>
                <Text style={{ fontSize: '24rpx', color: '#64748b' }}>▼</Text>
              </View>
              <Picker
                title="请选择性别"
                visible={genderPickerVisible}
                options={[genderOptions]}
                onClose={() => setGenderPickerVisible(false)}
                onConfirm={(options, values) => {
                  if (values && values.length > 0) {
                    setSelectedGender(values[0] as PetGender)
                  }
                  setGenderPickerVisible(false)
                }}
              />
            </View>
          </View>

          {/* 体型选择 */}
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
              <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>体型</Text>
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
              onClick={() => setSizePickerVisible(true)}
            >
              <Text style={{ fontSize: '28rpx', color: '#0d171c' }}>
                {getSizeText()}
              </Text>
              <Text style={{ fontSize: '24rpx', color: '#64748b' }}>▼</Text>
            </View>
            <Picker
              title="请选择体型"
              visible={sizePickerVisible}
              options={[sizeOptions]}
              onClose={() => setSizePickerVisible(false)}
              onConfirm={(options, values) => {
                if (values && values.length > 0) {
                  setSelectedSize(values[0] as PetSize)
                }
                setSizePickerVisible(false)
              }}
            />
          </View>

          {/* 宠物简介 */}
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
              <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>关于宠物</Text>
              <Text style={{ fontSize: '24rpx', color: '#94a3b8', marginLeft: '8rpx' }}>（可选）</Text>
            </View>
            <TextArea
              value={bio}
              onChange={(val) => setBio(val)}
              placeholder="任何特殊习惯、喜欢的玩具或医疗需求？"
              maxLength={200}
              style={{
                '--nutui-textarea-padding': '24rpx',
                '--nutui-textarea-font-size': '28rpx',
                width: '100%',
                minHeight: '160rpx',
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
          <View className="flex items-center justify-center" style={{ gap: '16rpx' }}>
            <Text style={{ fontSize: '32rpx' }}>🐾</Text>
            <Text style={{ fontSize: '30rpx', fontWeight: '700', color: 'white' }}>
              {saving ? '保存中...' : (isEditing ? '更新宠物资料' : '保存宠物资料')}
            </Text>
          </View>
        </Button>
      </View>
    </View>
  )
}

export default AddPet
