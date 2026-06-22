<!--
  Part1Leaflet.vue - 实验1: Leaflet 地图与标注交互
  功能：多底图切换、POI标注、地图书签、比例尺、坐标显示、距离测量
-->
<template>
  <div class="part1-container">
    <!-- 地图容器 -->
    <div ref="mapEl" class="map-container"></div>

    <!-- 左侧书签面板 -->
    <div class="side-panel bookmark-panel">
      <h3>📍 地图书签</h3>
      <div class="bookmark-list">
        <button
          v-for="bm in bookmarks"
          :key="bm.name"
          class="btn bookmark-btn"
          @click="flyToBookmark(bm)"
        >
          {{ bm.icon }} {{ bm.name }}
        </button>
      </div>

      <h3 style="margin-top: 14px">📏 距离测量</h3>
      <div class="measure-section">
        <button
          class="btn"
          :class="{ active: measuring }"
          @click="toggleMeasure"
        >
          {{ measuring ? '停止测距' : '开始测距' }}
        </button>
        <button v-if="measurePoints.length" class="btn" @click="clearMeasure">
          清除
        </button>
        <div v-if="totalDistance > 0" class="measure-result">
          总距离: <strong>{{ formatDistance(totalDistance) }}</strong>
        </div>
        <div v-if="measurePoints.length" class="measure-result">
          已标记 {{ measurePoints.length }} 个点
        </div>
      </div>

      <h3 style="margin-top: 14px">🗂️ POI 类型筛选</h3>
      <div class="filter-section">
        <label v-for="t in poiTypes" :key="t" class="filter-label">
          <input type="checkbox" :value="t" v-model="activeTypes" />
          <span
            class="type-dot"
            :style="{ background: getTypeColor(t) }"
          ></span>
          {{ t }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import { useMapStore } from '@/stores/mapStore.js'
import { getDefaultBaseMaps } from '@/utils/tiandituLayers.js'
import { poiTypeColors } from '@/utils/colorSchemes.js'
import { haversineDistance } from '@/utils/geoUtils.js'
import { loadGeoJSON } from '@/utils/geoJsonProcessor.js'

const mapStore = useMapStore()
const mapEl = ref(null)
let map = null

// ===== 书签数据 =====
const bookmarks = [
  { name: '解放碑', icon: '🏛️', center: [29.558, 106.577], zoom: 16 },
  { name: '洪崖洞', icon: '🏮', center: [29.563, 106.576], zoom: 16 },
  { name: '南山一棵树', icon: '🌳', center: [29.527, 106.588], zoom: 15 },
  { name: '重庆大学', icon: '🎓', center: [29.566, 106.468], zoom: 15 },
  { name: '观音桥', icon: '🛍️', center: [29.579, 106.545], zoom: 15 },
]

const flyToBookmark = (bm) => {
  map.flyTo(bm.center, bm.zoom, { duration: 1.5 })
}

// ===== POI 筛选 =====
const poiTypes = Object.keys(poiTypeColors)
const activeTypes = ref([...poiTypes])
const getTypeColor = (t) => poiTypeColors[t] || '#999'

// ===== 测距功能 =====
const measuring = ref(false)
const measurePoints = ref([])
const totalDistance = ref(0)
let measureLine = null
let measureMarkers = []

const toggleMeasure = () => {
  measuring.value = !measuring.value
  if (measuring.value) {
    map.getContainer().style.cursor = 'crosshair'
    map.on('click', onMeasureClick)
  } else {
    map.getContainer().style.cursor = ''
    map.off('click', onMeasureClick)
  }
}

const onMeasureClick = (e) => {
  const { lat, lng } = e.latlng
  measurePoints.value.push([lat, lng])

  const marker = L.circleMarker([lat, lng], {
    radius: 5,
    color: '#e74c3c',
    fillColor: '#fff',
    fillOpacity: 1,
    weight: 2,
  }).addTo(map)
  measureMarkers.push(marker)

  if (measurePoints.value.length > 1) {
    const pts = measurePoints.value
    const [lat1, lng1] = pts[pts.length - 2]
    const [lat2, lng2] = pts[pts.length - 1]
    totalDistance.value += haversineDistance(lat1, lng1, lat2, lng2)

    if (measureLine) map.removeLayer(measureLine)
    measureLine = L.polyline(pts.map(([la, ln]) => [la, ln]), {
      color: '#e74c3c',
      weight: 2,
      dashArray: '6, 4',
    }).addTo(map)
  }

  // 显示点距离标注
  if (measurePoints.value.length > 1) {
    const pts = measurePoints.value
    const [lat1, lng1] = pts[pts.length - 2]
    const [lat2, lng2] = pts[pts.length - 1]
    const dist = haversineDistance(lat1, lng1, lat2, lng2)
    const midLat = (lat1 + lat2) / 2
    const midLng = (lng1 + lng2) / 2
    const tooltip = L.tooltip({
      permanent: true,
      direction: 'center',
      className: 'measure-tooltip',
    })
      .setLatLng([midLat, midLng])
      .setContent(formatDistance(dist))
      .addTo(map)
    measureMarkers.push(tooltip)
  }
}

const clearMeasure = () => {
  measurePoints.value = []
  totalDistance.value = 0
  measureMarkers.forEach((m) => map.removeLayer(m))
  measureMarkers = []
  if (measureLine) {
    map.removeLayer(measureLine)
    measureLine = null
  }
}

const formatDistance = (m) => {
  return m >= 1000 ? (m / 1000).toFixed(2) + ' km' : m.toFixed(0) + ' m'
}

// ===== POI 图层 =====
let poiLayer = null

const loadPOIs = async () => {
  const data = await loadGeoJSON('/data/pois.geojson')

  poiLayer = L.geoJSON(data, {
    filter: (feature) => activeTypes.value.includes(feature.properties.type),
    pointToLayer: (feature, latlng) => {
      const color = poiTypeColors[feature.properties.type] || '#999'
      return L.divIcon({
        className: 'custom-poi-icon',
        html: `<div style="
          width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
          background: ${color}; transform: rotate(-45deg);
          border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        "><span style="transform: rotate(45deg); color: #fff; font-size: 12px; font-weight: bold;">${feature.properties.type[0]}</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      })
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties
      const color = poiTypeColors[p.type] || '#999'
      layer.bindPopup(`
        <div class="poi-popup">
          <h3>${p.name}</h3>
          <span class="popup-type" style="background: ${color}22; color: ${color}">${p.type}</span>
          <p class="popup-desc">${p.desc}</p>
          <p class="popup-desc">热度: ${'⭐'.repeat(Math.round(p.value / 20))}</p>
        </div>
      `, { maxWidth: 250 })
      layer.bindTooltip(p.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -30],
      })
    },
  }).addTo(map)
}

// 监听筛选变化
watch(activeTypes, () => {
  if (poiLayer) {
    map.removeLayer(poiLayer)
    loadPOIs()
  }
}, { deep: true })

// ===== 地图初始化 =====
onMounted(async () => {
  // 修复 Leaflet 图标
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  // 初始化地图
  map = L.map(mapEl.value).setView([29.56, 106.55], 12)

  // 多底图 + 图层切换
  const baseMaps = getDefaultBaseMaps()
  baseMaps['高德标准'].addTo(map)
  L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map)

  // 比例尺
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map)

  // 鼠标坐标同步
  map.on('mousemove', (e) => {
    mapStore.updateMouseCoord(e.latlng.lat, e.latlng.lng)
  })

  // 加载 POI 数据
  await loadPOIs()
})

onUnmounted(() => {
  if (measuring.value) {
    map.off('click', onMeasureClick)
  }
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.part1-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.bookmark-panel {
  width: 240px;
}

.bookmark-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bookmark-btn {
  text-align: left;
  font-size: 13px;
}

.measure-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.measure-result {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 4px 0;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  padding: 3px 0;
}

.filter-label input[type='checkbox'] {
  accent-color: var(--accent);
}

.type-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
