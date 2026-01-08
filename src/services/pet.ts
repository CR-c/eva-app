import { get, post, put, del } from '@/utils/request'
import type {
  Pet,
  PetVO,
  PetDTO,
  PetQueryDTO,
  PetTag,
  GrowthPhoto,
  GrowthPhotoDTO,
  GrowthPhotoQueryDTO,
  GrowthRecord,
  GrowthRecordDTO,
  GrowthRecordQueryDTO,
  PageInfo,
  OptionItem,
} from '@/constants/types'

// ==================== 宠物管理 ====================

/**
 * 获取宠物列表
 */
export async function getPetList(params?: PetQueryDTO) {
  const response = await get<PageInfo<PetVO>>('/api/v1/pets', params)
  return response.data
}

/**
 * 获取宠物详情
 */
export async function getPetById(id: number) {
  const response = await get<PetVO>(`/api/v1/pets/${id}`)
  return response.data
}

/**
 * 创建宠物
 */
export async function createPet(data: PetDTO) {
  const response = await post<number>('/api/v1/pets', data, {
    showLoading: true,
  })
  return response.data
}

/**
 * 更新宠物
 */
export async function updatePet(id: number, data: PetDTO) {
  const response = await put<void>(`/api/v1/pets/${id}`, data, {
    showLoading: true,
  })
  return response.data
}

/**
 * 删除宠物
 */
export async function deletePet(id: number) {
  const response = await del<void>(`/api/v1/pets/${id}`, undefined, {
    showLoading: true,
  })
  return response.data
}

// ==================== 标签管理 ====================

/**
 * 获取标签列表
 */
export async function getTagList() {
  const response = await get<PetTag[]>('/api/v1/tags')
  return response.data
}

// ==================== 成长照片管理 ====================

/**
 * 获取成长照片列表
 */
export async function getGrowthPhotoList(petId: number, params?: GrowthPhotoQueryDTO) {
  const response = await get<PageInfo<GrowthPhoto>>(`/api/v1/pets/${petId}/growth-photos`, params)
  return response.data
}

/**
 * 获取成长照片详情
 */
export async function getGrowthPhotoById(petId: number, id: number) {
  const response = await get<GrowthPhoto>(`/api/v1/pets/${petId}/growth-photos/${id}`)
  return response.data
}

/**
 * 创建成长照片
 */
export async function createGrowthPhoto(petId: number, data: GrowthPhotoDTO) {
  const response = await post<number>(`/api/v1/pets/${petId}/growth-photos`, data, {
    showLoading: true,
  })
  return response.data
}

/**
 * 更新成长照片
 */
export async function updateGrowthPhoto(petId: number, id: number, data: GrowthPhotoDTO) {
  const response = await put<void>(`/api/v1/pets/${petId}/growth-photos/${id}`, data, {
    showLoading: true,
  })
  return response.data
}

/**
 * 删除成长照片
 */
export async function deleteGrowthPhoto(petId: number, id: number) {
  const response = await del<void>(`/api/v1/pets/${petId}/growth-photos/${id}`, undefined, {
    showLoading: true,
  })
  return response.data
}

// ==================== 成长记录管理 ====================

/**
 * 获取成长记录列表
 */
export async function getGrowthRecordList(petId: number, params?: GrowthRecordQueryDTO) {
  const response = await get<PageInfo<GrowthRecord>>(`/api/v1/pets/${petId}/growth-records`, params)
  return response.data
}

/**
 * 获取成长记录详情
 */
export async function getGrowthRecordById(petId: number, id: number) {
  const response = await get<GrowthRecord>(`/api/v1/pets/${petId}/growth-records/${id}`)
  return response.data
}

/**
 * 创建成长记录
 */
export async function createGrowthRecord(petId: number, data: GrowthRecordDTO) {
  const response = await post<number>(`/api/v1/pets/${petId}/growth-records`, data, {
    showLoading: true,
  })
  return response.data
}

/**
 * 更新成长记录
 */
export async function updateGrowthRecord(petId: number, id: number, data: GrowthRecordDTO) {
  const response = await put<void>(`/api/v1/pets/${petId}/growth-records/${id}`, data, {
    showLoading: true,
  })
  return response.data
}

/**
 * 删除成长记录
 */
export async function deleteGrowthRecord(petId: number, id: number) {
  const response = await del<void>(`/api/v1/pets/${petId}/growth-records/${id}`, undefined, {
    showLoading: true,
  })
  return response.data
}

// ==================== 选项接口 ====================

/**
 * 获取品种选项列表
 */
export async function getBreedOptions() {
  const response = await get<OptionItem[]>('/api/v1/pets/options/breeds')
  return response.data
}

/**
 * 获取体型选项列表
 */
export async function getSizeOptions() {
  const response = await get<OptionItem[]>('/api/v1/pets/options/sizes')
  return response.data
}

/**
 * 获取性别选项列表
 */
export async function getGenderOptions() {
  const response = await get<OptionItem[]>('/api/v1/pets/options/genders')
  return response.data
}
