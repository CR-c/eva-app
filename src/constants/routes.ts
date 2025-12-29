// Route constants
export const ROUTES = {
  LOGIN: '/pages/login/index',
  HOME: '/pages/home/index',
  WALKING: '/pages/walking/index',
  WALK_SUMMARY: '/pages/walkSummary/index',
  PETS: '/pages/pets/index',
  ADD_PET: '/pages/addPet/index',
  ADD_GROWTH_PHOTO: '/pages/addGrowthPhoto/index',
  GROWTH_TIMELINE: '/pages/growthTimeline/index',
  GROWTH_GALLERY: '/pages/growthGallery/index',
  MENU: '/pages/menu/index',
  PROFILE: '/pages/profile/index',
  EDIT_PROFILE: '/pages/profile/edit/index',
} as const

// White list pages (no auth required)
export const WHITE_LIST = [ROUTES.LOGIN]
