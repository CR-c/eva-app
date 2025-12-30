import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { 
  Form, 
  FormItem, 
  TextArea, 
  DatePicker,
  Toast,
  Loading
} from '@nutui/nutui-react-taro'
import FormPage from '@/components/FormPage'
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
  const [form] = Form.useForm()
  const [petId, setPetId] = useState('')
  const [petName, setPetName] = useState('')
  const [photo, setPhoto] = useState('')
  const [ageInMonths, setAgeInMonths] = useState(0)
  const [loading, setLoading] = useState(true)

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
    
    // 设置表单默认值
    form.setFieldsValue({
      date: formattedDate,
      notes: ''
    })

    setLoading(false)
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
        Toast.show({
          content: '选择图片失败',
          type: 'fail'
        })
      }
    })
  }

  const handleSubmit = async (values: any) => {
    if (!photo) {
      throw new Error('请选择照片')
    }

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
        date: values.date,
        notes: values.notes?.trim() || '',
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

      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('Failed to save growth photo:', error)
      throw new Error('保存失败，请重试')
    }
  }

  if (loading) {
    return (
      <FormPage title="新增成长记录" showSubmitButton={false}>
        <View className="flex justify-center items-center h-64">
          <Loading type="spinner" />
          <Text className="ml-2 text-gray-500">加载中...</Text>
        </View>
      </FormPage>
    )
  }

  return (
    <FormPage
      title="新增成长记录"
      onSubmit={handleSubmit}
      submitText="保存到时间线"
      className="bg-gray-50"
    >
      {/* 宠物信息提示 */}
      {petName && (
        <View className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <View className="flex items-center">
            <Text className="text-2xl mr-2">🐕</Text>
            <Text className="text-blue-800 font-medium">
              {petName} 现在 {Math.floor(ageInMonths / 12)} 岁 {ageInMonths % 12} 个月了！
            </Text>
          </View>
        </View>
      )}

      {/* 照片上传区域 */}
      <View className="mb-6">
        <Text className="text-lg font-medium mb-3 text-gray-800">成长照片</Text>
        <View 
          className="relative w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handlePhotoUpload}
        >
          {photo ? (
            <Image 
              className="w-full h-full rounded-lg object-cover"
              src={photo}
              mode="aspectFill"
            />
          ) : (
            <View className="flex flex-col items-center p-8">
              <View className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Text className="text-3xl">📷</Text>
              </View>
              <Text className="text-lg font-medium text-gray-700 mb-2">添加照片</Text>
              <Text className="text-sm text-gray-500 text-center mb-4">
                点击这里上传你的宠物照片
              </Text>
              <View className="px-6 py-2 bg-blue-500 rounded-lg">
                <Text className="text-white font-medium">选择照片</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 拍摄日期 */}
      <FormItem
        label="拍摄日期"
        name="date"
        rules={[{ required: true, message: '请选择拍摄日期' }]}
      >
        <DatePicker
          type="date"
          className="bg-white border border-gray-200 rounded-lg"
        />
      </FormItem>

      {/* 备注 */}
      <FormItem
        label="备注"
        name="notes"
      >
        <TextArea
          placeholder="记录体重、身高或者可爱的瞬间..."
          rows={4}
          maxLength={300}
          className="bg-white border border-gray-200 rounded-lg p-3"
        />
      </FormItem>
    </FormPage>
  )
}

export default AddGrowthPhoto