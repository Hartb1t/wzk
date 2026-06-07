<template>
  <div class="leaflet-wrapper">
    <div v-if="loading" class="loading-overlay">
      <span class="loading-text">地图加载中...</span>
    </div>
    <div ref="mapContainer" class="leaflet-map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * @typedef {Object} MarkerOption
 * @property {number[]} position - 标记点坐标 [纬度, 经度]
 * @property {string} [popup] - 弹窗内容（支持 HTML）
 * @property {boolean} [openPopup] - 是否自动打开弹窗
 * @property {Function} [onClick] - 点击回调
 */

// Props 定义
const props = defineProps({
  /** 地图中心点 [纬度, 经度] */
  center: {
    type: Array,
    default: () => [29.56, 106.55]
  },
  /** 缩放级别 */
  zoom: {
    type: Number,
    default: 12
  },
  /** 标记点配置 */
  markers: {
    type: Array,
    default: () => []
  },
  /** 地图高度 */
  height: {
    type: String,
    default: '500px'
  }
})

const emit = defineEmits(['mapReady', 'markerClick'])

const mapContainer = ref(null)
const loading = ref(true)
let mapInstance = null
let markerLayers = []

/**
 * 修复 Leaflet 默认图标在打包后路径失效问题
 * 使用 CDN 加载图标资源
 */
const fixLeafletIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
  })
}

/**
 * 初始化地图
 */
const initMap = () => {
  if (!mapContainer.value) return

  mapInstance = L.map(mapContainer.value).setView(props.center, props.zoom)

  // 添加 OpenStreetMap 底图
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapInstance)

  // 添加标记点
  addMarkers(props.markers)

  // 地图加载完成
  loading.value = false
  emit('mapReady', mapInstance)
}

/**
 * 添加标记点
 * @param {MarkerOption[]} markers - 标记点配置数组
 */
const addMarkers = (markers) => {
  clearMarkers()
  markers.forEach(marker => {
    const markerLayer = L.marker(marker.position)
      .addTo(mapInstance)
      .bindPopup(marker.popup || '')

    if (marker.openPopup) {
      markerLayer.openPopup()
    }

    if (marker.onClick) {
      markerLayer.on('click', () => emit('markerClick', marker))
    }

    markerLayers.push(markerLayer)
  })
}

/**
 * 清除所有标记点
 */
const clearMarkers = () => {
  markerLayers.forEach(layer => layer.remove())
  markerLayers = []
}

onMounted(() => {
  fixLeafletIcon()
  initMap()
})

/**
 * 组件卸载时销毁地图实例，防止内存泄漏
 */
onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

// 监听 markers 变化
watch(() => props.markers, (newMarkers) => {
  if (mapInstance && newMarkers) {
    addMarkers(newMarkers)
  }
}, { deep: true })

// 监听 center 变化
watch(() => props.center, (newCenter) => {
  if (mapInstance && newCenter) {
    mapInstance.setView(newCenter, props.zoom)
  }
})

// 暴露方法给父组件
defineExpose({
  /** 获取地图实例 */
  getMap: () => mapInstance,
  /** 添加单个标记点 */
  addMarker: (marker) => {
    if (!mapInstance) return
    const layer = L.marker(marker.position)
      .addTo(mapInstance)
      .bindPopup(marker.popup || '')
    if (marker.openPopup) layer.openPopup()
    markerLayers.push(layer)
  },
  /** 清除所有标记点 */
  clearMarkers
})
</script>

<style scoped>
.leaflet-wrapper {
  position: relative;
  width: 100%;
}

.leaflet-map {
  width: 100%;
  height: v-bind(height);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-text {
  color: #666;
  font-size: 14px;
}
</style>
