<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 修复 Leaflet 默认图标路径问题
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const mapContainer = ref(null)
let mapInstance = null

onMounted(() => {
  // 初始化地图，中心点设为重庆 (纬度, 经度)
  mapInstance = L.map(mapContainer.value).setView([29.56, 106.55], 12)

  // 添加 OpenStreetMap 底图
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapInstance)

  // 添加标记点并显示弹窗
  L.marker([29.56, 106.55])
    .addTo(mapInstance)
    .bindPopup('<b>重庆主城区</b>')
    .openPopup()
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
}
</style>
