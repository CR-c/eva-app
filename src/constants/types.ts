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
