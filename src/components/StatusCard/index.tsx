import React from 'react'
import { View, Text } from '@tarojs/components'
import { Card } from '@nutui/nutui-react-taro'

interface StatusCardProps {
  /** 状态类型 */
  status: 'success' | 'warning' | 'error' | 'info'
  /** 标题 */
  title: string
  /** 描述 */
  description?: string
  /** 图标 */
  icon?: React.ReactNode
  /** 是否可点击 */
  clickable?: boolean
  /** 点击事件 */
  onClick?: () => void
  /** 自定义样式类名 */
  className?: string
}

const StatusCard: React.FC<StatusCardProps> = ({
  status,
  title,
  description,
  icon,
  clickable = false,
  onClick,
  className = ''
}) => {
  const statusConfig = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200', 
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800', 
      iconColor: 'text-red-500'
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    }
  }

  const config = statusConfig[status]
  const cursorClass = clickable ? 'cursor-pointer' : ''

  return (
    <Card
      className={`${config.bgColor} ${config.borderColor} border ${cursorClass} ${className}`}
      onClick={clickable ? onClick : undefined}
    >
      <View className="flex items-start gap-3 p-2">
        {/* 图标 */}
        {icon && (
          <View className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
            {icon}
          </View>
        )}
        
        {/* 内容 */}
        <View className="flex-1">
          <Text className={`${config.textColor} font-medium text-base mb-1`}>
            {title}
          </Text>
          
          {description && (
            <Text className={`${config.textColor} opacity-80 text-sm leading-relaxed`}>
              {description}
            </Text>
          )}
        </View>
      </View>
    </Card>
  )
}

export default StatusCard