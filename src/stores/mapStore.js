/**
 * Pinia Map Store - 全局地图与图层状态管理
 * 管理地图中心点、缩放级别、图层列表、当前坐标等全局状态
 * 支持 localStorage 持久化
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LayerModel } from '@/utils/layerModel.js'

/** @type {string} localStorage 持久化键名 */
const STORAGE_KEY = 'gis-map-store'

/**
 * 从 localStorage 恢复状态
 * @returns {Object|null} 持久化的状态对象
 */
const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * 将状态保存到 localStorage
 * @param {Object} state - 需要持久化的状态
 */
const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('持久化状态失败:', e)
  }
}

export const useMapStore = defineStore('map', () => {
  // 从 localStorage 恢复初始状态
  const saved = loadState()

  /** 地图中心点 [纬度, 经度] */
  const center = ref(saved?.center ?? [29.56, 106.55])

  /** 缩放级别 */
  const zoom = ref(saved?.zoom ?? 12)

  /** 当前主题 light/dark */
  const theme = ref(saved?.theme ?? 'light')

  /** 当前鼠标经纬度 */
  const mouseCoord = ref({ lat: null, lng: null })

  /** 图层配置列表（序列化后的普通对象） */
  const layerConfigs = ref(saved?.layerConfigs ?? [
    { id: 'districts', name: '重庆区县', type: 'geojson', url: '/data/chongqing.geojson', visible: true, opacity: 1, style: { color: '#3388ff' } },
    { id: 'pois', name: '厦门市', type: 'geojson', url: '/data/pois.geojson', visible: true, opacity: 0.8, style: { color: '#ff7800' } },
    { id: 'roads', name: '道路网络', type: 'geojson', url: '/data/roads.geojson', visible: false, opacity: 0.6, style: { color: '#33cc33' } },
    { id: 'basemap', name: 'OpenStreetMap', type: 'tile', url: '', visible: true, opacity: 1, style: {} },
  ])

  /** 当前激活的工具 */
  const activeTool = ref(saved?.activeTool ?? 'pan')

  // Computed: 可见图层数量
  const visibleLayerCount = computed(() =>
    layerConfigs.value.filter((l) => l.visible).length
  )

  // Computed: 可见图层列表
  const visibleLayers = computed(() =>
    layerConfigs.value.filter((l) => l.visible)
  )

  /**
   * 切换图层可见性
   * @param {string} layerId - 图层 ID
   */
  const toggleLayer = (layerId) => {
    const layer = layerConfigs.value.find((l) => l.id === layerId)
    if (layer) {
      layer.visible = !layer.visible
      persist()
    }
  }

  /**
   * 设置图层透明度
   * @param {string} layerId - 图层 ID
   * @param {number} opacity - 透明度
   */
  const setLayerOpacity = (layerId, opacity) => {
    const layer = layerConfigs.value.find((l) => l.id === layerId)
    if (layer) {
      layer.opacity = opacity
      persist()
    }
  }

  /** 更新鼠标坐标 */
  const updateMouseCoord = (lat, lng) => {
    mouseCoord.value = { lat, lng }
  }

  /** 更新地图视图 */
  const setView = (newCenter, newZoom) => {
    center.value = newCenter
    zoom.value = newZoom
    persist()
  }

  /** 切换主题 */
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme.value)
    persist()
  }

  /** 设置激活工具 */
  const setActiveTool = (tool) => {
    activeTool.value = tool
    persist()
  }

  /** 持久化状态到 localStorage */
  const persist = () => {
    saveState({
      center: center.value,
      zoom: zoom.value,
      theme: theme.value,
      layerConfigs: layerConfigs.value,
      activeTool: activeTool.value,
    })
  }

  // 初始化时应用主题
  document.documentElement.setAttribute('data-theme', theme.value)

  return {
    center,
    zoom,
    theme,
    mouseCoord,
    layerConfigs,
    activeTool,
    visibleLayerCount,
    visibleLayers,
    toggleLayer,
    setLayerOpacity,
    updateMouseCoord,
    setView,
    toggleTheme,
    setActiveTool,
    persist,
  }
})
