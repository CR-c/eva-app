import { View, Text } from '@tarojs/components'
import './index.scss'

interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onLocate: () => void
}

function MapControls({ onZoomIn, onZoomOut, onLocate }: MapControlsProps) {
  return (
    <View className="map-controls">
      <View className="control-button" onClick={onZoomIn}>
        <Text className="control-icon">+</Text>
      </View>
      
      <View className="control-button" onClick={onZoomOut}>
        <Text className="control-icon">-</Text>
      </View>
      
      <View className="control-button locate-button" onClick={onLocate}>
        <Text className="control-icon">📍</Text>
      </View>
    </View>
  )
}

export default MapControls