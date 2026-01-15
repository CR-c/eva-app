// NutUI-React Taro 类型声明文件
declare module '@nutui/nutui-react-taro' {
  import { ComponentType } from 'react'

  // 基础组件
  export const Button: ComponentType<any>
  export const Cell: ComponentType<any>
  export const CellGroup: ComponentType<any>
  export const ConfigProvider: ComponentType<any>
  export const Image: ComponentType<any>
  export const Overlay: ComponentType<any>
  export const Divider: ComponentType<any>
  export const Grid: ComponentType<any>
  export const GridItem: ComponentType<any>
  export const Layout: ComponentType<any>
  export const Col: ComponentType<any>
  export const Row: ComponentType<any>
  export const SafeArea: ComponentType<any>
  export const Space: ComponentType<any>
  export const Sticky: ComponentType<any>

  // 导航组件
  export const BackTop: ComponentType<any>
  export const Elevator: ComponentType<any>
  export const FixedNav: ComponentType<any>
  export const HoverButton: ComponentType<any>
  export const HoverButtonItem: ComponentType<any>
  export const NavBar: ComponentType<any>
  export const SideBar: ComponentType<any>
  export const SideBarItem: ComponentType<any>
  export const Tabbar: ComponentType<any>
  export const TabbarItem: ComponentType<any>
  export const TabPane: ComponentType<any>
  export const Tabs: ComponentType<any>

  // 表单组件
  export const Address: ComponentType<any>
  export const Calendar: ComponentType<any>
  export const CalendarItem: ComponentType<any>
  export const CalendarCard: ComponentType<any>
  export const Cascader: ComponentType<any>
  export const Checkbox: ComponentType<any>
  export const CheckboxGroup: ComponentType<any>
  export const DatePicker: ComponentType<any>
  export const DatePickerView: ComponentType<any>
  // 表单组件
  export const Form: ComponentType<any> & {
    useForm: () => [any]
  }
  export const FormItem: ComponentType<any>
  export const Input: ComponentType<any>
  export const InputNumber: ComponentType<any>
  export const Menu: ComponentType<any>
  export const MenuItem: ComponentType<any>
  export const NumberKeyboard: ComponentType<any>
  export const Picker: ComponentType<any>
  export const PickerView: ComponentType<any>
  export const Radio: ComponentType<any>
  export const RadioGroup: ComponentType<any>
  export const Range: ComponentType<any>
  export const Rate: ComponentType<any>
  export const SearchBar: ComponentType<any>
  export const ShortPassword: ComponentType<any>
  export const Signature: ComponentType<any>
  export const Switch: ComponentType<any>
  export const TextArea: ComponentType<any>
  export const Uploader: ComponentType<any>

  // 反馈组件
  export const ActionSheet: ComponentType<any>
  export const Badge: ComponentType<any>
  export const Dialog: ComponentType<any>
  export const Drag: ComponentType<any>
  export const Empty: ComponentType<any>
  export const InfiniteLoading: ComponentType<any>
  export const Loading: ComponentType<any>
  export const NoticeBar: ComponentType<any>
  export const Notify: ComponentType<any>
  export const Popover: ComponentType<any>
  export const Popup: ComponentType<any>
  export const PullToRefresh: ComponentType<any>
  export const ResultPage: ComponentType<any>
  export const Skeleton: ComponentType<any>
  export const Swipe: ComponentType<any>
  export const Toast: {
    show: (options: any) => void
    hide: () => void
  }

  // 展示组件
  export const Animate: ComponentType<any>
  export const AnimatingNumbers: ComponentType<any>
  export const Audio: ComponentType<any>
  export const Avatar: ComponentType<any>
  export const AvatarGroup: ComponentType<any>
  export const CircleProgress: ComponentType<any>
  export const Collapse: ComponentType<any>
  export const CollapseItem: ComponentType<any>
  export const CountDown: ComponentType<any>
  export const Ellipsis: ComponentType<any>
  export const ImagePreview: ComponentType<any>
  export const Indicator: ComponentType<any>
  export const Lottie: ComponentType<any>
  export const Pagination: ComponentType<any>
  export const Price: ComponentType<any>
  export const Progress: ComponentType<any>
  export const Segmented: ComponentType<any>
  export const Step: ComponentType<any>
  export const Steps: ComponentType<any>
  export const Swiper: ComponentType<any>
  export const SwiperItem: ComponentType<any>
  export const Table: ComponentType<any>
  export const Tag: ComponentType<any>
  export const Tour: ComponentType<any>
  export const Video: ComponentType<any>
  export const VirtualList: ComponentType<any>

  // 业务组件
  export const AvatarCropper: ComponentType<any>
  export const Barrage: ComponentType<any>
  export const Card: ComponentType<any>
  export const TimeDetail: ComponentType<any>
  export const TimeSelect: ComponentType<any>
  export const TrendArrow: ComponentType<any>
  export const WaterMark: ComponentType<any>

  // Icon 组件
  export const Icon: ComponentType<any>
}
