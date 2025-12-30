import React, { useState } from 'react'
import { View } from '@tarojs/components'
import { Form, Button, Toast } from '@nutui/nutui-react-taro'
import BasePage from '../BasePage'

interface FormPageProps {
  title?: string
  showBack?: boolean
  showHome?: boolean
  onSubmit?: (values: any) => Promise<void> | void
  submitText?: string
  className?: string
  children: React.ReactNode
}

const FormPage: React.FC<FormPageProps> = ({
  title = '',
  showBack = true,
  showHome = false,
  onSubmit,
  submitText = '提交',
  className = '',
  children
}) => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async () => {
    if (!onSubmit) return

    try {
      // Validate form
      const values = await form.validateFields()
      
      setLoading(true)
      await onSubmit(values)
      
      Toast.show({
        content: '提交成功',
        type: 'success'
      })
    } catch (error: any) {
      console.error('Form submission error:', error)
      
      // Handle validation errors
      if (error?.errorFields) {
        Toast.show({
          content: '请检查表单输入',
          type: 'warn'
        })
        return
      }
      
      // Handle submission errors
      Toast.show({
        content: error?.message || '提交失败，请重试',
        type: 'fail'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <BasePage
      title={title}
      showBack={showBack}
      showHome={showHome}
      className={className}
    >
      <View className="p-4">
        <Form
          form={form}
          className="space-y-4"
        >
          {children}
          
          {onSubmit && (
            <View className="pt-6">
              <Button
                type="primary"
                size="large"
                loading={loading}
                onClick={handleSubmit}
                className="w-full bg-blue-500 hover:bg-blue-600 border-blue-500"
              >
                {submitText}
              </Button>
            </View>
          )}
        </Form>
      </View>
    </BasePage>
  )
}

export default FormPage