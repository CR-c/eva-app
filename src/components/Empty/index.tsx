import { View, Image } from '@tarojs/components'

interface EmptyProps {
  text?: string
  image?: string
}

function Empty({ text = '暂无数据', image }: EmptyProps) {
  return (
    <View className="empty-component">
      {image && <Image src={image} className="empty-image" />}
      <View className="empty-text">{text}</View>
    </View>
  )
}

export default Empty
