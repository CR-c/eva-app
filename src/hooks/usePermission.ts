import { useUserStore } from '@/store/user'

/**
 * 权限判断 Hook
 */
export function usePermission() {
  const hasPermission = useUserStore((state) => state.hasPermission)
  const hasRole = useUserStore((state) => state.hasRole)
  const hasAnyPermission = useUserStore((state) => state.hasAnyPermission)
  const hasAnyRole = useUserStore((state) => state.hasAnyRole)

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAnyRole,
  }
}
