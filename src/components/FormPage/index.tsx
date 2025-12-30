import React, { useState } from 'react'
import { View } from '@tarojs/components'
import { Form, Button, Toast, Loading } from '@nutui/nutui-react-taro'
import BasePage from '../BasePage'

interface FormPageProps {
  title?: string
  showBack?: boolean
  showHome?: boolean
  onSubmit?: (values: any) => Promise<void> | void
  submitText?: string
  className?: string
  children: React.ReactNode
  validateTrigger?: 'onBlur' | 'onChange' | 'onSubmit'
  showSubmitButton?: boolean
  disabled?: boolean
}

const FormPage: React.FC<FormPageProps> = ({
  title = '',
  showBack = true,
  showHome = false,
  onSubmit,
  submitText = '提交',
  className = '',
  children,
  validateTrigger = 'onBlur',
  showSubmitButton = true,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async () => {
    if (!onSubmit || disabled) return

    try {
      // Validate form
      const values = await form.validateFields()
      
      setLoading(true)
      await onSubmit(values)
      
      Toast.show({
        content: '提交成功',
        type: 'success',
        duration: 2000
      })
    } catch (error: any) {
      console.error('Form submission error:', error)
      
      // Handle validation errors
      if (error?.errorFields) {
        const firstError = error.errorFields[0]?.errors[0]
        Toast.show({
          content: firstError || '请检查表单输入',
          type: 'warn',
          duration: 3000
        })
        return
      }
      
      // Handle submission errors
      Toast.show({
        content: error?.message || '提交失败，请重试',
        type: 'fail',
        duration: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    // Optional: Handle form value changes for real-time validation
    console.log('Form values changed:', changedValues, allValues)
  }

  return (
    <BasePage
      title={title}
      showBack={showBack}
      showHome={showHome}
      className={className}
    >
      <View className="p-4 pb-8">
        <Form
          form={form}
          className="space-y-4"
          validateTrigger={validateTrigger}
          onValuesChange={handleFormValuesChange}
        >
          {children}
          
          {onSubmit && showSubmitButton && (
            <View className="pt-6 sticky bottom-4">
              <Button
                type="primary"
                size="large"
                loading={loading}
                disabled={disabled}
                onClick={handleSubmit}
                className="w-full bg-blue-500 hover:bg-blue-600 border-blue-500 disabled:bg-gray-300 disabled:border-gray-300"
              >
                {loading ? '提交中...' : submitText}
              </Button>
            </View>
          )}
        </Form>
        
        {/* Loading overlay for better UX */}
        {loading && (
          <View className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <View className="bg-white rounded-lg p-6 flex flex-col items-center">
              <Loading type="spinner" />
              <View className="mt-2 text-gray-600">处理中...</View>
            </View>
          </View>
        )}
      </View>
    </BasePage>
  )
}

export default FormPage