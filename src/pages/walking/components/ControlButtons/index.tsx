import { View, Text } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import './index.scss'

interface ControlButtonsProps {
  isWalking: boolean
  hasActiveWalk: boolean
  isOperating?: boolean
  onPauseResume: () => void
  onEndWalk?: () => void
}

function ControlButtons({ isWalking, hasActiveWalk, isOperating = false, onPauseResume, onEndWalk }: ControlButtonsProps) {
  const getButtonText = () => {
    if (isOperating) {
      return '操作中...'
    }
    if (!hasActiveWalk) {
      return '开始散步'
    }
    return isWalking ? '暂停散步' : '继续散步'
  }

  const getButtonIcon = () => {
    if (isOperating) {
      return '⏳'
    }
    if (!hasActiveWalk) {
      return '🚀'
    }
    return isWalking ? '⏸️' : '▶️'
  }

  return (
    <View className='control-buttons'>
      {/* 主要控制按钮 */}
      <Button 
        className={`primary-button ${isOperating ? 'disabled' : ''}`}
        onClick={isOperating ? undefined : onPauseResume}
        disabled={isOperating}
      >
        <View className='button-content'>
          <Text className='button-icon'>{getButtonIcon()}</Text>
          <Text className='button-text'>{getButtonText()}</Text>
        </View>
      </Button>

      {/* 结束散步按钮 - 总是显示用于测试 */}
      <Button 
        className={`secondary-button ${isOperating ? 'disabled' : ''}`}
        onClick={isOperating ? undefined : onEndWalk}
        disabled={isOperating}
      >
        <Text className='secondary-button-text'>结束散步 {onEndWalk ? '✓' : '✗'}</Text>
      </Button>
    </View>
  )
}

export default ControlButtons
