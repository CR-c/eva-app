// Common types for the Eva app

export interface BaseResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// NutUI-React component prop extensions
export interface BasePageProps {
  title?: string
  showBack?: boolean
  rightContent?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export interface FormPageProps {
  title: string
  onSubmit: (values: any) => Promise<void>
  children: React.ReactNode
  submitText?: string
  loading?: boolean
}

// Platform detection types
export type PlatformType = 'weapp' | 'tt' | 'h5' | 'swan' | 'alipay' | 'qq' | 'jd' | 'rn'

export interface PlatformConfig {
  platform: PlatformType
  isWeapp: boolean
  isTT: boolean
  isH5: boolean
  supportedFeatures: string[]
}

// Migration and testing types
export interface MigrationStatus {
  phase: 'preparation' | 'dependencies' | 'components' | 'pages' | 'testing' | 'cleanup'
  completedSteps: string[]
  currentStep: string
}

export interface ComponentMigrationInfo {
  originalComponent: string
  targetComponent: string
  migrationStatus: 'pending' | 'in-progress' | 'completed' | 'failed'
  propsMapping: Record<string, string>
  styleChanges: Array<{
    from: string
    to: string
    context: string
  }>
}

// Property-based testing types
export interface PropertyTestConfig {
  iterations: number
  seed?: number
  timeout?: number
  verbose?: boolean
}

export interface PropertyTestResult {
  passed: boolean
  counterExample?: any
  error?: string
  iterations: number
  seed: number
}