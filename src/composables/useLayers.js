/**
 * useLayers Composable - 图层管理复用逻辑
 * 封装图层搜索、过滤、统计等通用逻辑
 * 可在 LayerPanel / DataView 等多个组件中复用
 */
import { ref, computed } from 'vue'
import { useMapStore } from '@/stores/mapStore.js'

export function useLayers() {
  const mapStore = useMapStore()

  /** 搜索关键字 */
  const searchQuery = ref('')

  /** 过滤后的图层列表（支持搜索） */
  const filteredLayers = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return mapStore.layerConfigs
    return mapStore.layerConfigs.filter(
      (layer) =>
        layer.name.toLowerCase().includes(q) ||
        layer.type.toLowerCase().includes(q) ||
        layer.id.toLowerCase().includes(q)
    )
  })

  /** 可见图层数量 */
  const visibleCount = computed(() => mapStore.visibleLayerCount)

  /** 图层总数 */
  const totalCount = computed(() => mapStore.layerConfigs.length)

  /** 按类型分组的图层 */
  const layersByType = computed(() => {
    const groups = {}
    mapStore.layerConfigs.forEach((layer) => {
      const type = layer.type || 'unknown'
      if (!groups[type]) groups[type] = []
      groups[type].push(layer)
    })
    return groups
  })

  /**
   * 切换图层可见性
   * @param {string} layerId
   */
  const toggleLayer = (layerId) => {
    mapStore.toggleLayer(layerId)
  }

  /**
   * 设置图层透明度
   * @param {string} layerId
   * @param {number} opacity
   */
  const setOpacity = (layerId, opacity) => {
    mapStore.setLayerOpacity(layerId, opacity)
  }

  /**
   * 全部显示/隐藏
   * @param {boolean} visible
   */
  const setAllVisible = (visible) => {
    mapStore.layerConfigs.forEach((layer) => {
      if (layer.type !== 'tile') {
        layer.visible = visible
      }
    })
    mapStore.persist()
  }

  return {
    searchQuery,
    filteredLayers,
    visibleCount,
    totalCount,
    layersByType,
    toggleLayer,
    setOpacity,
    setAllVisible,
  }
}
