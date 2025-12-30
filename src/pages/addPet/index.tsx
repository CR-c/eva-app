import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { 
  Form, 
  FormItem, 
  Input, 
  TextArea, 
  Picker, 
  Toast,
  Loading
} from '@nutui/nutui-react-taro'
import FormPage from '@/components/FormPage'
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

function AddPet() {
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

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
  const genderOptions = [
    { text: '♂️ 公', value: 'male' },
    { text: '♀️ 母', value: 'female' }
  ]
  
  // 体型选项
  const sizeOptions = [
    { text: '小型', value: 'small' },
    { text: '中型', value: 'medium' },
    { text: '大型', value: 'large' }
  ]

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
          // Set form values using NutUI Form with correct picker format
          const genderText = genderOptions.find(g => g.value === pet.gender)?.text || '♂️ 公'
          const sizeText = sizeOptions.find(s => s.value === pet.size)?.text || '中型'
          
          form.setFieldsValue({
            name: pet.name,
            breed: [pet.breed],
            age: pet.age.toString(),
            gender: [genderText],
            size: [sizeText],
            bio: pet.bio || ''
          })
          setPhotoUrl(pet.photo || '')
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
        setPhotoUrl(tempFilePath)
      },
      fail: (error) => {
        console.error('Failed to choose image:', error)
        Toast.show('选择图片失败')
      }
    })
  }

  const handleSubmit = async (values: any) => {
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

      // Convert picker values back to the expected format
      let gender: 'male' | 'female' = 'male'
      if (Array.isArray(values.gender) && values.gender.length > 0) {
        const genderIndex = genderOptions.map(g => g.text).indexOf(values.gender[0])
        gender = genderIndex >= 0 ? genderOptions[genderIndex].value as 'male' | 'female' : 'male'
      }

      let size: 'small' | 'medium' | 'large' = 'medium'
      if (Array.isArray(values.size) && values.size.length > 0) {
        const sizeIndex = sizeOptions.map(s => s.text).indexOf(values.size[0])
        size = sizeIndex >= 0 ? sizeOptions[sizeIndex].value as 'small' | 'medium' | 'large' : 'medium'
      }

      let breed = ''
      if (Array.isArray(values.breed) && values.breed.length > 0) {
        breed = values.breed[0]
      }

      const petData: Pet = {
        id: isEditing ? editingId : Date.now().toString(),
        name: values.name.trim(),
        breed: breed.trim(),
        age: parseInt(values.age),
        gender: gender,
        size: size,
        photo: photoUrl,
        bio: values.bio?.trim() || '',
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

      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('Failed to save pet:', error)
      throw new Error('保存失败，请重试')
    }
  }

  if (loading) {
    return (
      <FormPage title={isEditing ? '编辑宠物' : '添加新宠物'} showSubmitButton={false}>
        <View className="flex justify-center items-center h-64">
          <Loading type="spinner" />
          <Text className="ml-2 text-gray-500">加载中...</Text>
        </View>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={isEditing ? '编辑宠物' : '添加新宠物'}
      onSubmit={handleSubmit}
      submitText={isEditing ? '更新宠物资料' : '保存宠物资料'}
      className="bg-gray-50"
    >
      {/* 照片上传器 */}
      <View className="mb-6 flex flex-col items-center">
        <View 
          className="relative w-32 h-32 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handlePhotoUpload}
        >
          {photoUrl ? (
            <Image 
              className="w-full h-full rounded-full object-cover"
              src={photoUrl}
              mode="aspectFill"
            />
          ) : (
            <View className="flex flex-col items-center">
              <Text className="text-3xl mb-1">📷</Text>
              <Text className="text-xs text-gray-500">上传照片</Text>
            </View>
          )}
          <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Text className="text-white text-sm">✏️</Text>
          </View>
        </View>
        <Text className="mt-2 text-sm text-gray-500">点击添加宠物照片</Text>
      </View>

      {/* 宠物名称 */}
      <FormItem
        label="宠物名称"
        name="name"
        rules={[
          { required: true, message: '请输入宠物名称' },
          { min: 1, max: 20, message: '宠物名称长度应在1-20个字符之间' }
        ]}
      >
        <Input
          placeholder="例如：小白"
          className="bg-white border border-gray-200 rounded-lg px-3 py-2"
        />
      </FormItem>

      {/* 品种选择 */}
      <FormItem
        label="品种"
        name="breed"
        rules={[{ required: true, message: '请选择宠物品种' }]}
      >
        <Picker
          options={[breeds]}
          placeholder="请选择品种"
          className="bg-white border border-gray-200 rounded-lg"
        />
      </FormItem>

      {/* 年龄和性别 */}
      <View className="flex gap-4">
        <View className="flex-1">
          <FormItem
            label="年龄（岁）"
            name="age"
            rules={[
              { required: true, message: '请输入年龄' },
              { 
                validator: (_, value) => {
                  const age = parseInt(value)
                  if (isNaN(age) || age < 0 || age > 30) {
                    return Promise.reject(new Error('请输入0-30之间的有效年龄'))
                  }
                  return Promise.resolve(true)
                }
              }
            ]}
          >
            <Input
              type="number"
              placeholder="0"
              className="bg-white border border-gray-200 rounded-lg px-3 py-2"
            />
          </FormItem>
        </View>

        <View className="flex-1">
          <FormItem
            label="性别"
            name="gender"
            rules={[{ required: true, message: '请选择性别' }]}
            initialValue="male"
          >
            <Picker
              options={[genderOptions.map(g => g.text)]}
              placeholder="请选择性别"
              className="bg-white border border-gray-200 rounded-lg"
            />
          </FormItem>
        </View>
      </View>

      {/* 体型选择 */}
      <FormItem
        label="体型"
        name="size"
        rules={[{ required: true, message: '请选择体型' }]}
        initialValue="medium"
      >
        <Picker
          options={[sizeOptions.map(s => s.text)]}
          placeholder="请选择体型"
          className="bg-white border border-gray-200 rounded-lg"
        />
      </FormItem>

      {/* 宠物简介 */}
      <FormItem
        label={
          <View className="flex items-center">
            <Text>关于宠物</Text>
            <Text className="ml-2 text-sm text-gray-400">（可选）</Text>
          </View>
        }
        name="bio"
      >
        <TextArea
          placeholder="任何特殊习惯、喜欢的玩具或医疗需求？"
          rows={4}
          maxLength={200}
          className="bg-white border border-gray-200 rounded-lg p-3"
        />
      </FormItem>
    </FormPage>
  )
}

export default AddPet