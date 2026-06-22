<!--
  Part5Walkability.vue - T13: 城市路网结构与可步行性可视化
  功能：厦门思明区路网渲染、按等级/中心性分级着色、路段点选交互、局部放大
  数据来源：OSMnx 下载的 OSM 路网，经中心性计算后导出为 GeoJSON
-->
<template>
  <div class="part5-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <span>正在加载路网数据...</span>
    </div>

    <div ref="mapEl" class="map-container"></div>

    <!-- 左上控制面板 -->
    <div class="side-panel control-panel">
      <h3>🚶 城市路网分析</h3>
      <p class="panel-subtitle">厦门思明区 · OSM 路网</p>

      <!-- 路网类型切换 -->
      <div class="control-group">
        <label class="control-label">路网类型</label>
        <div class="btn-group">
          <button
            class="btn"
            :class="{ active: networkType === 'walk' }"
            @click="switchNetwork('walk')"
          >步行路网</button>
          <button
            class="btn"
            :class="{ active: networkType === 'drive' }"
            @click="switchNetwork('drive')"
          >驾车路网</button>
        </div>
      </div>

      <!-- 着色模式 -->
      <div class="control-group">
        <label class="control-label">着色方式</label>
        <div class="btn-group">
          <button
            class="btn"
            :class="{ active: colorMode === 'highway' }"
            @click="switchColorMode('highway')"
          >道路等级</button>
          <button
            class="btn"
            :class="{ active: colorMode === 'closeness' }"
            @click="switchColorMode('closeness')"
          >接近中心性</button>
          <button
            class="btn"
            :class="{ active: colorMode === 'betweenness' }"
            @click="switchColorMode('betweenness')"
          >介数中心性</button>
        </div>
      </div>

      <!-- 底图样式 -->
      <div class="control-group">
        <label class="control-label">底图样式</label>
        <div class="btn-group">
          <button
            v-for="s in styles"
            :key="s.key"
            class="btn"
            :class="{ active: activeStyle === s.key }"
            @click="switchStyle(s.key)"
          >{{ s.label }}</button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="control-group stats-box" v-if="stats">
        <label class="control-label">路网统计</label>
        <div class="stat-row">
          <span class="stat-label">路段数</span>
          <span class="stat-value">{{ stats.edgeCount.toLocaleString() }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">道路类型</span>
          <span class="stat-value">{{ stats.highwayTypes.length }} 种</span>
        </div>
        <div class="stat-row" v-if="stats.closenessRange">
          <span class="stat-label">接近中心性</span>
          <span class="stat-value">{{ stats.closenessRange[0].toFixed(4) }} ~ {{ stats.closenessRange[1].toFixed(4) }}</span>
        </div>
        <div class="stat-row" v-if="stats.betweennessRange">
          <span class="stat-label">介数中心性</span>
          <span class="stat-value">{{ stats.betweennessRange[0].toFixed(4) }} ~ {{ stats.betweennessRange[1].toFixed(4) }}</span>
        </div>
      </div>
    </div>

    <!-- 右下图例 -->
    <div class="road-legend" v-if="legendItems.length > 0">
      <h4>{{ legendTitle }}</h4>
      <div v-for="item in legendItems" :key="item.label" class="legend-item">
        <span class="legend-color" :style="{ background: item.color }"></span>
        <span class="legend-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { highwayTypeColors, highwayTypeLabels } from '@/utils/colorSchemes.js'

// ===== 响应式状态 =====
const mapEl = ref(null)
const loading = ref(true)
const networkType = ref('walk')
const colorMode = ref('highway')
const activeStyle = ref('positron')
const stats = ref(null)

let map = null

// ===== 数据缓存 =====
const dataCache = { walk: null, drive: null }
// 各数据集的中心性范围
const dataRanges = {
  walk: { closeness: [0, 0], betweenness: [0, 0] },
  drive: { closeness: [0, 0], betweenness: [0, 0] },
}

// ===== 底图样式配置 =====
const styles = [
  { key: 'positron', label: '简洁', url: 'https://tiles.openfreemap.org/styles/positron' },
  { key: 'dark', label: '暗色', url: 'https://tiles.openfreemap.org/styles/dark' },
  { key: 'liberty', label: '标准', url: 'https://tiles.openfreemap.org/styles/liberty' },
]

// ===== 中心性色阶配置 =====
// 接近中心性：Blues 色阶
const closenessColors = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#3182bd', '#08519c']
// 介数中心性：YlOrRd 色阶
const betweennessColors = ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c']

// ===== 工具函数 =====

/** 从 GeoJSON 计算中心性范围 */
function computeRanges(geojson) {
  let cMin = Infinity, cMax = -Infinity
  let bMin = Infinity, bMax = -Infinity
  for (const f of geojson.features) {
    const c = f.properties.closeness ?? 0
    const b = f.properties.betweenness ?? 0
    if (c < cMin) cMin = c
    if (c > cMax) cMax = c
    if (b < bMin) bMin = b
    if (b > bMax) bMax = b
  }
  return { closeness: [cMin, cMax], betweenness: [bMin, bMax] }
}

/** 从 GeoJSON 提取道路等级集合 */
function getHighwayTypes(geojson) {
  const types = new Set()
  for (const f of geojson.features) {
    if (f.properties.highway) types.add(f.properties.highway)
  }
  return [...types].sort()
}

/** 更新统计信息 */
function updateStats(type) {
  const data = dataCache[type]
  if (!data) return
  const ranges = dataRanges[type]
  stats.value = {
    edgeCount: data.features.length,
    highwayTypes: getHighwayTypes(data),
    closenessRange: ranges.closeness,
    betweennessRange: ranges.betweenness,
  }
}

/** 道路等级中文标签 */
function highwayLabel(hw) {
  return highwayTypeLabels[hw] || hw || '未知'
}

// ===== 着色表达式 =====

/** 构建按道路等级着色的 match 表达式 */
function buildHighwayColorExpr() {
  const expr = ['match', ['get', 'highway']]
  for (const [type, color] of Object.entries(highwayTypeColors)) {
    expr.push(type, color)
  }
  expr.push('#cccccc') // fallback
  return expr
}

/** 构建接近中心性 interpolate 表达式 */
function buildClosenessExpr() {
  const [min, max] = dataRanges[networkType.value].closeness
  const range = max - min || 1
  const expr = ['interpolate', ['linear'], ['get', 'closeness']]
  for (let i = 0; i < closenessColors.length; i++) {
    expr.push(min + range * (i / (closenessColors.length - 1)), closenessColors[i])
  }
  return expr
}

/** 构建介数中心性 interpolate 表达式 */
function buildBetweennessExpr() {
  const [min, max] = dataRanges[networkType.value].betweenness
  const range = max - min || 1
  const expr = ['interpolate', ['linear'], ['get', 'betweenness']]
  for (let i = 0; i < betweennessColors.length; i++) {
    expr.push(min + range * (i / (betweennessColors.length - 1)), betweennessColors[i])
  }
  return expr
}

/** 根据当前着色模式返回颜色表达式 */
function getColorExpression() {
  if (colorMode.value === 'closeness') return buildClosenessExpr()
  if (colorMode.value === 'betweenness') return buildBetweennessExpr()
  return buildHighwayColorExpr()
}

// ===== 图例 =====

const legendTitle = computed(() => {
  const typeLabel = networkType.value === 'walk' ? '步行' : '驾车'
  if (colorMode.value === 'closeness') return `${typeLabel} · 接近中心性`
  if (colorMode.value === 'betweenness') return `${typeLabel} · 介数中心性`
  return `${typeLabel} · 道路等级`
})

const legendItems = computed(() => {
  const items = []
  if (colorMode.value === 'highway') {
    // 显示当前数据中实际存在的道路等级
    const types = stats.value?.highwayTypes || []
    for (const t of types) {
      items.push({
        color: highwayTypeColors[t] || '#cccccc',
        label: highwayTypeLabels[t] || t,
      })
    }
  } else if (colorMode.value === 'closeness') {
    const [min, max] = dataRanges[networkType.value].closeness
    const range = max - min || 1
    for (let i = closenessColors.length - 1; i >= 0; i--) {
      const val = min + range * (i / (closenessColors.length - 1))
      items.push({ color: closenessColors[i], label: val.toFixed(4) })
    }
  } else {
    const [min, max] = dataRanges[networkType.value].betweenness
    const range = max - min || 1
    for (let i = betweennessColors.length - 1; i >= 0; i--) {
      const val = min + range * (i / (betweennessColors.length - 1))
      items.push({ color: betweennessColors[i], label: val.toFixed(4) })
    }
  }
  return items
})

// ===== 地图图层操作 =====

function addRoadLayers() {
  const data = dataCache[networkType.value]
  if (!data || !map) return

  // 添加数据源
  if (map.getSource('roads')) {
    map.getSource('roads').setData(data)
  } else {
    map.addSource('roads', { type: 'geojson', data })
  }

  // 主路线图层
  map.addLayer({
    id: 'roads-line',
    type: 'line',
    source: 'roads',
    paint: {
      'line-color': getColorExpression(),
      'line-width': [
        'match', ['get', 'highway'],
        'motorway', 4, 'trunk', 3.5, 'trunk_link', 3,
        'primary', 3, 'primary_link', 2.5,
        'secondary', 2.5, 'secondary_link', 2,
        'tertiary', 2, 'tertiary_link', 1.8,
        'residential', 1.8, 'living_street', 1.5,
        'pedestrian', 1.5, 'footway', 1.2,
        'cycleway', 1.2, 'steps', 1,
        'service', 1, 'path', 1,
        1.2, // fallback
      ],
      'line-opacity': 0.9,
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
  })

  // 悬停高亮图层
  map.addLayer({
    id: 'roads-highlight',
    type: 'line',
    source: 'roads',
    paint: {
      'line-color': '#ffffff',
      'line-width': 6,
      'line-opacity': 0.8,
    },
    filter: ['==', ['get', 'osmid'], ''],
  })
}

function removeRoadLayers() {
  const layers = ['roads-highlight', 'roads-line']
  for (const id of layers) {
    if (map.getLayer(id)) map.removeLayer(id)
  }
}

function refreshLayers() {
  removeRoadLayers()
  addRoadLayers()
}

function updateColor() {
  if (!map || !map.getLayer('roads-line')) return
  map.setPaintProperty('roads-line', 'line-color', getColorExpression())
}

// ===== 交互切换函数 =====

function switchNetwork(type) {
  if (networkType.value === type) return
  networkType.value = type
  updateStats(type)
  // 更新数据源并重绘
  if (map.getSource('roads')) {
    map.getSource('roads').setData(dataCache[type])
  }
  // 更新颜色表达式
  updateColor()
  // 飞到对应范围
  const center = [118.089, 24.479]
  map.flyTo({ center, zoom: type === 'walk' ? 14 : 13, speed: 0.8 })
}

function switchColorMode(mode) {
  if (colorMode.value === mode) return
  colorMode.value = mode
  updateColor()
}

function switchStyle(key) {
  activeStyle.value = key
  const style = styles.find((s) => s.key === key)
  map.setStyle(style.url)
}

// ===== 生命周期 =====

onMounted(async () => {
  // 并行加载步行和驾车路网数据
  try {
    const [walkResp, driveResp] = await Promise.all([
      fetch('/data/xiamen-walk.geojson').then((r) => r.json()),
      fetch('/data/xiamen-drive.geojson').then((r) => r.json()),
    ])
    dataCache.walk = walkResp
    dataCache.drive = driveResp

    // 计算中心性范围
    dataRanges.walk = computeRanges(walkResp)
    dataRanges.drive = computeRanges(driveResp)

    updateStats('walk')
  } catch (err) {
    console.error('路网数据加载失败:', err)
    loading.value = false
    return
  }

  // 初始化地图
  map = new maplibregl.Map({
    container: mapEl.value,
    style: styles[0].url,
    center: [118.089, 24.479],
    zoom: 14,
    pitch: 0,
    bearing: 0,
  })

  map.addControl(new maplibregl.NavigationControl(), 'top-right')
  map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

  map.on('load', () => {
    addRoadLayers()
    loading.value = false
  })

  // 底图切换后重绘图层
  map.on('style.load', () => {
    if (map.isStyleLoaded() && dataCache[networkType.value]) {
      addRoadLayers()
    }
  })

  // ===== 路段点击交互 =====
  map.on('click', 'roads-line', (e) => {
    if (!e.features || e.features.length === 0) return
    const props = e.features[0].properties
    const coords = e.lngLat

    const html = `
      <div style="font-size:13px;line-height:1.7;min-width:200px;padding:2px;">
        <h4 style="margin:0 0 8px;color:#1a1a2e;font-size:14px;border-bottom:1px solid #e2e8f0;padding-bottom:6px;">
          ${props.name || '未命名道路'}
        </h4>
        <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
          <span style="color:#4a5568;">道路等级</span>
          <span style="font-weight:500;">${highwayLabel(props.highway)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
          <span style="color:#4a5568;">路段长度</span>
          <span style="font-weight:500;">${Math.round(props.length)} m</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
          <span style="color:#4a5568;">接近中心性</span>
          <span style="font-weight:500;">${(props.closeness ?? 0).toFixed(4)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
          <span style="color:#4a5568;">介数中心性</span>
          <span style="font-weight:500;">${(props.betweenness ?? 0).toFixed(4)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#4a5568;">OSM ID</span>
          <span style="font-weight:500;font-size:11px;color:#64748b;">${props.osmid}</span>
        </div>
      </div>
    `

    new maplibregl.Popup({ maxWidth: '280px', closeButton: true })
      .setLngLat(coords)
      .setHTML(html)
      .addTo(map)

    // 局部放大
    map.flyTo({
      center: coords,
      zoom: Math.max(map.getZoom(), 16),
      speed: 0.8,
    })
  })

  // ===== 悬停高亮 =====
  map.on('mouseenter', 'roads-line', (e) => {
    map.getCanvas().style.cursor = 'pointer'
    if (e.features && e.features.length > 0) {
      const osmid = e.features[0].properties.osmid
      map.setFilter('roads-highlight', ['==', ['get', 'osmid'], osmid])
    }
  })

  map.on('mouseleave', 'roads-line', () => {
    map.getCanvas().style.cursor = ''
    map.setFilter('roads-highlight', ['==', ['get', 'osmid'], ''])
  })
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.part5-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.control-panel {
  width: 260px;
}

.panel-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin: -6px 0 12px 0;
}

.control-group {
  margin-bottom: 14px;
}

.control-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

/* 统计信息框 */
.stats-box {
  background: var(--bg-secondary);
  border-radius: 6px;
  padding: 8px 10px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 2px 0;
}

.stat-label {
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 500;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 11px;
}

/* 图例面板 */
.road-legend {
  position: absolute;
  bottom: 30px;
  right: 10px;
  z-index: 1000;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 10px 14px;
  box-shadow: var(--shadow-md);
  font-size: 12px;
  line-height: 1.6;
  max-height: 360px;
  overflow-y: auto;
}

.road-legend h4 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-color);
}

.road-legend .legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 1px 0;
}

.road-legend .legend-color {
  width: 20px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.road-legend .legend-label {
  color: var(--text-secondary);
  white-space: nowrap;
}
</style>
