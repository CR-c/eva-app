import { View, Text, Button } from '@tarojs/components'
import './index.scss'

interface ControlButtonsProps {
  isWalking: boolean
  onPauseResume: () => void
  onEndWalk: () => void
}

function ControlButtons({ isWalking, onPauseResume, onEndWalk }: ControlButtonsProps) {
  return (
    <View className="control-buttons">
      {/* 主要控制按钮 */}
      <Button className="primary-button" onClick={onPauseResume}>
        <View className="button-content">
          <Text className="button-icon">{isWalking ? '⏸️' : '▶️'}</Text>
          <Text className="button-text">{isWalking ? '暂停散步' : '继续散步'}</Text>
        </View>
      </Button>
      
      {/* 结束散步按钮 */}
      <Button className="secondary-button" onClick={onEndWalk}>
        <Text className="secondary-button-text">结束散步</Text>
      </Button>
    </View>
  )
}

export default ControlButtons