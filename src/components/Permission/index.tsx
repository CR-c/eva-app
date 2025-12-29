import { ReactNode } from 'react'
import { usePermission } from '@/hooks/usePermission'

interface PermissionProps {
  children: ReactNode
  permission?: string | string[]
  role?: string | string[]
  mode?: 'any' | 'all' // any: 满足任意一个, all: 满足所有
}

/**
 * 权限控制组件
 * @example
 * // 需要特定权限
 * <Permission permission="system:user:list">
 *   <View>需要权限才能看到</View>
 * </Permission>
 *
 * // 需要特定角色
 * <Permission role="admin">
 *   <View>只有管理员可以看到</View>
 * </Permission>
 *
 * // 需要满足任意一个权限
 * <Permission permission={['system:user:add', 'system:user:edit']} mode="any">
 *   <View>有任意一个权限即可看到</View>
 * </Permission>
 */
function Permission({ children, permission, role, mode = 'all' }: PermissionProps) {
  const { hasPermission, hasRole, hasAnyPermission, hasAnyRole } = usePermission()

  // 权限判断
  if (permission) {
    if (Array.isArray(permission)) {
      const hasAccess = mode === 'any' ? hasAnyPermission(permission) : permission.every(hasPermission)
      if (!hasAccess) return null
    } else {
      if (!hasPermission(permission)) return null
    }
  }

  // 角色判断
  if (role) {
    if (Array.isArray(role)) {
      const hasAccess = mode === 'any' ? hasAnyRole(role) : role.every(hasRole)
      if (!hasAccess) return null
    } else {
      if (!hasRole(role)) return null
    }
  }

  return <>{children}</>
}

export default Permission
