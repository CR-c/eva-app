import { create } from 'zustand'
import type { PetVO, PetTag } from '@/constants/types'
import * as petService from '@/services/pet'

interface PetStore {
  // 状态
  pets: PetVO[]
  currentPet: PetVO | null
  tags: PetTag[]
  loading: boolean

  // 操作
  fetchPets: () => Promise<void>
  fetchPetById: (id: number) => Promise<PetVO | null>
  fetchTags: () => Promise<void>
  setCurrentPet: (pet: PetVO | null) => void
  addPet: (pet: PetVO) => void
  updatePetInList: (pet: PetVO) => void
  removePet: (id: number) => void
  clearPets: () => void
}

export const usePetStore = create<PetStore>((set, get) => ({
  // 初始状态
  pets: [],
  currentPet: null,
  tags: [],
  loading: false,

  // 获取宠物列表
  fetchPets: async () => {
    set({ loading: true })
    try {
      const result = await petService.getPetList({ pageSize: 100 })
      set({ pets: result.list || [] })
    } catch (error) {
      console.error('Failed to fetch pets:', error)
    } finally {
      set({ loading: false })
    }
  },

  // 获取单个宠物详情
  fetchPetById: async (id: number) => {
    try {
      const pet = await petService.getPetById(id)
      set({ currentPet: pet })
      return pet
    } catch (error) {
      console.error('Failed to fetch pet:', error)
      return null
    }
  },

  // 获取标签列表
  fetchTags: async () => {
    try {
      const tags = await petService.getTagList()
      set({ tags })
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  },

  // 设置当前宠物
  setCurrentPet: (pet: PetVO | null) => {
    set({ currentPet: pet })
  },

  // 添加宠物到列表
  addPet: (pet: PetVO) => {
    const { pets } = get()
    set({ pets: [...pets, pet] })
  },

  // 更新列表中的宠物
  updatePetInList: (pet: PetVO) => {
    const { pets } = get()
    const index = pets.findIndex(p => p.id === pet.id)
    if (index !== -1) {
      const newPets = [...pets]
      newPets[index] = pet
      set({ pets: newPets })
    }
  },

  // 从列表中移除宠物
  removePet: (id: number) => {
    const { pets, currentPet } = get()
    set({
      pets: pets.filter(p => p.id !== id),
      currentPet: currentPet?.id === id ? null : currentPet,
    })
  },

  // 清空宠物数据
  clearPets: () => {
    set({ pets: [], currentPet: null })
  },
}))
