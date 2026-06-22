<!--
  MapView.vue - 地图页面视图
  集成 Leaflet 地图，监听鼠标移动更新坐标，与工具栏联动
  使用 mapStore 管理地图状态
-->
<template>
  <div class="map-view">
    <div ref="mapContainer" class="leaflet-map"></div>

    <!-- 工具栏操作提示 -->
    <div class="tool-hint" v-if="mapStore.activeTool !== 'pan'">
      当前工具: <strong>{{ toolLabels[mapStore.activeTool] }}</strong>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMapStore } from '@/stores/mapStore.js'

const mapStore = useMapStore()
const mapContainer = ref(null)
let mapInstance = null

/** 工具名称映射 */
const toolLabels = {
  pan: '平移',
  measure: '测距',
  marker: '标记',
  select: '选择',
}

/**
 * 修复 Leaflet 默认图标路径
 */
const fixIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

/**
 * 初始化地图实例
 */
const initMap = () => {
  if (!mapContainer.value) return

  mapInstance = L.map(mapContainer.value).setView(mapStore.center, mapStore.zoom)

  // 添加 CartoDB Voyager 底图（无需API Key，无跨域限制）
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(mapInstance)

  // 添加重庆标记点
  L.marker([29.56, 106.55])
    .addTo(mapInstance)
    .bindPopup('<b>重庆主城区</b><br>智慧城市 GIS 平台')
    .openPopup()

  // 监听鼠标移动，更新坐标到 Store
  mapInstance.on('mousemove', (e) => {
    mapStore.updateMouseCoord(e.latlng.lat, e.latlng.lng)
  })

  // 监听地图移动，同步中心点和缩放级别
  mapInstance.on('moveend', () => {
    const center = mapInstance.getCenter()
    mapStore.setView([center.lat, center.lng], mapInstance.getZoom())
  })

  // 点击地图添加标记（marker 工具模式）
  mapInstance.on('click', (e) => {
    if (mapStore.activeTool === 'marker') {
      L.marker([e.latlng.lat, e.latlng.lng])
        .addTo(mapInstance)
        .bindPopup(`标记点<br>纬度: ${e.latlng.lat.toFixed(4)}<br>经度: ${e.latlng.lng.toFixed(4)}`)
        .openPopup()
    }
  })
}

onMounted(() => {
  fixIcon()
  initMap()
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<style scoped>
.map-view {
  position: relative;
  width: 100%;
  height: 100%;
}

.leaflet-map {
  width: 100%;
  height: 100%;
}

.tool-hint {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 12px;
  background: var(--bg-sidebar);
  border: 1px solid var(--accent);
  border-radius: 6px;
  font-size: 12px;
  color: var(--accent);
  z-index: 1000;
  box-shadow: 0 2px 8px var(--shadow-color);
}
</style>
