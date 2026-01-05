import React, { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import { useImagePicker, useToast } from '@/hooks/usePlatformAPI'

interface ImageUploaderProps {
  /** 已上传的图片列表 */
  value?: string[]
  /** 图片变化回调 */
  onChange?: (images: string[]) => void
  /** 最大上传数量 */
  maxCount?: number
  /** 是否支持多选 */
  multiple?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 上传按钮文本 */
  uploadText?: string
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = [],
  onChange,
  maxCount = 9,
  multiple = true,
  className = '',
  disabled = false,
  uploadText = '上传图片'
}) => {
  const [uploading, setUploading] = useState(false)
  const { chooseImage } = useImagePicker()
  const { showSuccess, showError } = useToast()

  const handleChooseImage = async () => {
    if (disabled || uploading) return

    try {
      setUploading(true)
      
      const remainingCount = maxCount - value.length
      if (remainingCount <= 0) {
        showError(`最多只能上传${maxCount}张图片`)
        return
      }

      const result = await chooseImage({
        count: multiple ? Math.min(remainingCount, 9) : 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (result?.tempFilePaths) {
        const newImages = [...value, ...result.tempFilePaths]
        onChange?.(newImages)
        showSuccess('图片上传成功')
      }
    } catch (error) {
      console.error('选择图片失败:', error)
      showError('选择图片失败')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    if (disabled) return
    
    const newImages = value.filter((_, i) => i !== index)
    onChange?.(newImages)
  }

  const handlePreviewImage = (current: string) => {
    // Use platform API for better compatibility
    import('@tarojs/taro').then(Taro => {
      Taro.default.previewImage({
        current,
        urls: value
      })
    })
  }

  const canUpload = value.length < maxCount && !disabled

  return (
    <View className={`${className}`}>
      <View className="grid grid-cols-3 gap-3">
        {/* 已上传的图片 */}
        {value.map((image, index) => (
          <View key={index} className="relative aspect-square">
            <Image
              src={image}
              className="w-full h-full object-cover rounded-lg border border-gray-200"
              mode="aspectFill"
              onClick={() => handlePreviewImage(image)}
            />
            
            {/* 删除按钮 */}
            {!disabled && (
              <View
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                onClick={() => handleRemoveImage(index)}
              >
                <Text className="text-white text-xs">×</Text>
              </View>
            )}
          </View>
        ))}
        
        {/* 上传按钮 */}
        {canUpload && (
          <View
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50"
            onClick={handleChooseImage}
          >
            <Text className="text-2xl text-gray-400 mb-1">+</Text>
            <Text className="text-xs text-gray-400 text-center px-1">
              {uploadText}
            </Text>
          </View>
        )}
      </View>
      
      {/* 上传状态提示 */}
      {uploading && (
        <View className="mt-2">
          <Text className="text-sm text-gray-500">上传中...</Text>
        </View>
      )}
      
      {/* 数量提示 */}
      <View className="mt-2">
        <Text className="text-xs text-gray-400">
          {value.length}/{maxCount}
        </Text>
      </View>
    </View>
  )
}

export default ImageUploader