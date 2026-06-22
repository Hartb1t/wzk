/**
 * useTheme Composable - 主题切换复用逻辑
 * 管理深色/浅色主题切换，联动 CSS 变量
 */
import { computed } from 'vue'
import { useMapStore } from '@/stores/mapStore.js'

export function useTheme() {
  const mapStore = useMapStore()

  /** 当前是否为深色模式 */
  const isDark = computed(() => mapStore.theme === 'dark')

  /** 主题显示名称 */
  const themeLabel = computed(() => (isDark.value ? '深色模式' : '浅色模式'))

  /** 主题切换图标 */
  const themeIcon = computed(() => (isDark.value ? '☀️' : '🌙'))

  /** 切换主题 */
  const toggleTheme = () => {
    mapStore.toggleTheme()
  }

  return {
    isDark,
    themeLabel,
    themeIcon,
    toggleTheme,
  }
}
