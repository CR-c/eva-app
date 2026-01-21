/**
 * API 统一响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

/**
 * 用户信息
 */
export interface UserInfo {
  userId: number
  username: string
  nickname: string
  avatar?: string
  phone?: string
  openid?: string
  unionid?: string
  email?: string
  gender?: 0 | 1 | 2 // 0: 女, 1: 男, 2: 未知
  birthday?: string
  signature?: string
  location?: string
  roles?: string[]
  permissions?: string[]
}

/**
 * 账号密码登录参数
 */
export interface PasswordLoginParams {
  username: string
  password: string
  captcha?: string
  uuid?: string
}

/**
 * 微信登录参数
 */
export interface WxLoginParams {
  code: string
  type: 'miniapp' | 'mp'
  encryptedData?: string
  iv?: string
}

/**
 * 登录响应数据
 */
export interface LoginData {
  token: string
  userId: number
  username: string
  nickname: string
  avatar?: string
  roles?: string[]
  permissions?: string[]
}

/**
 * 检查用户是否存在的响应
 */
export interface CheckUserExistData {
  exist: boolean
  openid: string
}

/**
 * 注册请求参数
 */
export interface RegisterParams {
  code: string
  nickname: string
  phone: string
  avatar?: string
}

/**
 * 微信用户信息
 */
export interface WxUserInfo {
  nickName: string
  avatarUrl: string
  gender: 0 | 1 | 2
}

// ==================== 宠物模块类型 ====================

/**
 * 宠物性别
 */
export type PetGender = 'male' | 'female'

/**
 * 宠物体型
 */
export type PetSize = 'small' | 'medium' | 'large'

/**
 * 宠物信息
 */
export interface Pet {
  id: number
  name: string
  breed: string
  age: number
  gender: PetGender
  size: PetSize
  photo?: string
  bio?: string
  birthDate?: string
  createdAt: string
}

/**
 * 宠物统计信息
 */
export interface PetStats {
  photoCount: number
  recordCount: number
}

/**
 * 宠物详情（含统计）
 */
export interface PetVO extends Pet {
  stats?: PetStats
}

/**
 * 创建/更新宠物参数
 */
export interface PetDTO {
  name: string
  breed: string
  age: number
  gender: PetGender
  size: PetSize
  photo?: string
  bio?: string
  birthDate?: string
}

/**
 * 宠物查询参数
 */
export interface PetQueryDTO {
  name?: string
  breed?: string
  gender?: PetGender
  size?: PetSize
  pageNum?: number
  pageSize?: number
}

/**
 * 标签
 */
export interface PetTag {
  id: number
  name: string
  icon?: string
  sortOrder: number
}

/**
 * 成长照片
 */
export interface GrowthPhoto {
  id: number
  petId: number
  photoUrl: string
  photoDate: string
  description?: string
  ageInMonths?: number
  tags: PetTag[]
  createdAt: string
}

/**
 * 创建/更新成长照片参数
 */
export interface GrowthPhotoDTO {
  photoUrl: string
  photoDate: string
  description?: string
  tagIds?: number[]
}

/**
 * 成长照片查询参数
 */
export interface GrowthPhotoQueryDTO {
  tagId?: number
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

/**
 * 成长记录
 */
export interface GrowthRecord {
  id: number
  petId: number
  recordDate: string
  weight?: number
  height?: number
  notes?: string
  photoUrl?: string
  milestone?: string
  createdAt: string
}

/**
 * 创建/更新成长记录参数
 */
export interface GrowthRecordDTO {
  recordDate: string
  weight?: number
  height?: number
  notes?: string
  photoUrl?: string
  milestone?: string
}

/**
 * 成长记录查询参数
 */
export interface GrowthRecordQueryDTO {
  startDate?: string
  endDate?: string
  hasMilestone?: boolean
  pageNum?: number
  pageSize?: number
}

/**
 * 分页响应
 */
export interface PageInfo<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

/**
 * 选项项（用于下拉选择等）
 */
export interface OptionItem {
  value: string
  label: string
}

// ==================== 遛狗模块类型 ====================

/**
 * 轨迹点
 */
export interface TrackPoint {
  lat: number
  lng: number
  t: number
  spd?: number
  acc?: number
}

/**
 * 遛狗记录
 */
export interface WalkRecord {
  id: number
  petId: number | null
  petName?: string
  petPhoto?: string
  startTime: string
  endTime: string | null
  duration: number
  distance: number
  avgPace: number | null
  calories: number
  status: number
  statusDesc?: string
  weather: string | null
  temperature: number | null
  coverImage?: string
  createdAt: string
}

/**
 * 遛狗记录详情
 */
export interface WalkDetail extends WalkRecord {
  startLatitude: number
  startLongitude: number
  endLatitude: number | null
  endLongitude: number | null
  trackPoints: TrackPoint[]
  trackPointCount: number
  note?: string
}

/**
 * 开始遛狗参数
 */
export interface WalkStartDTO {
  petId?: number
  startLatitude: number
  startLongitude: number
  weather?: string
  temperature?: number
}

/**
 * 结束遛狗参数
 */
export interface WalkEndDTO {
  duration: number
  distance: number
  endLatitude: number
  endLongitude: number
  trackPoints: string
  calories?: number
  note?: string
  coverImage?: string
}

/**
 * 遛狗查询参数
 */
export interface WalkQueryDTO {
  petId?: number
  status?: number
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

/**
 * 遛狗统计数据
 */
export interface WalkStatistics {
  type: string
  dateRange: string
  walkCount: number
  totalDuration: number
  totalDistance: number
  totalCalories: number
  avgPace: number | null
  dailyStats: DailyStat[]
}

/**
 * 每日统计数据
 */
export interface DailyStat {
  date: string
  walkCount: number
  duration: number
  distance: number
}
