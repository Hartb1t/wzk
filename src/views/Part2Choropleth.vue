<!--
  Part2Choropleth.vue - 实验2: GeoJSON 专题地图
  功能：分级设色图、比例符号图、图例、信息面板、filter过滤、pointToLayer
  配色方案说明：
    - 顺序色阶（YlOrRd）：适用于人口/GDP等连续递增数据，颜色从浅黄到深红
    - 发散色阶（RdYlBu）：适用于增长率等正负对比数据
-->
<template>
  <div class="part2-container">
    <div ref="mapEl" class="map-container"></div>

    <!-- 左上控制面板 -->
    <div class="side-panel control-panel">
      <h3>📊 专题地图控制</h3>

      <!-- 视图模式切换 -->
      <div class="control-group">
        <label class="control-label">视图模式</label>
        <div class="btn-group">
          <button
            class="btn"
            :class="{ active: viewMode === 'choropleth' }"
            @click="switchView('choropleth')"
          >分级设色</button>
          <button
            class="btn"
            :class="{ active: viewMode === 'proportional' }"
            @click="switchView('proportional')"
          >比例符号</button>
        </div>
      </div>

      <!-- 数据字段选择 -->
      <div class="control-group">
        <label class="control-label">数据字段</label>
        <div class="btn-group">
          <button
            v-for="field in fields"
            :key="field.key"
            class="btn"
            :class="{ active: activeField === field.key }"
            @click="changeField(field.key)"
          >{{ field.label }}</button>
        </div>
      </div>

      <!-- 配色方案选择 -->
      <div class="control-group">
        <label class="control-label">配色方案</label>
        <div class="btn-group">
          <button
            class="btn"
            :class="{ active: activeScheme === 'YlOrRd' }"
            @click="changeScheme('YlOrRd')"
          >YlOrRd</button>
          <button
            class="btn"
            :class="{ active: activeScheme === 'Blues' }"
            @click="changeScheme('Blues')"
          >Blues</button>
          <button
            class="btn"
            :class="{ active: activeScheme === 'RdYlBu' }"
            @click="changeScheme('RdYlBu')"
          >RdYlBu (发散)</button>
        </div>
      </div>

      <!-- 过滤控制 -->
      <div class="control-group">
        <label class="control-label">
          人口过滤: ≥ {{ filterMin }} 万人
        </label>
        <input
          type="range"
          min="0"
          max="300"
          step="10"
          v-model.number="filterMin"
          class="range-input"
        />
      </div>

      <!-- 配色说明 -->
      <div class="control-group scheme-info">
        <label class="control-label">配色说明</label>
        <p class="info-text">
          <strong>YlOrRd</strong>（顺序色阶）：黄→橙→红，适用于人口密度、GDP等连续递增数据。低值用浅色，高值用深色，符合直觉认知。
        </p>
        <p class="info-text">
          <strong>RdYlBu</strong>（发散色阶）：红→黄→蓝，适用于增长率等正负对比数据。红色代表高值/正增长，蓝色代表低值/负增长。
        </p>
      </div>
    </div>

    <!-- 右上信息面板 -->
    <div class="info-panel hover-info" v-if="hoverInfo">
      <h4>{{ hoverInfo.name }}</h4>
      <div class="info-row">
        <span>{{ activeFieldLabel }}:</span>
        <strong>{{ hoverInfo.value }} {{ activeFieldUnit }}</strong>
      </div>
      <div class="info-row">
        <span>面积:</span>
        <span>{{ hoverInfo.area }} km²</span>
      </div>
      <div class="info-row">
        <span>人口密度:</span>
        <span>{{ hoverInfo.density }} 人/km²</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import { getDefaultBaseMaps } from '@/utils/tiandituLayers.js'
import {
  sequentialYlOrRd, sequentialBlues, divergentRdYlBu,
  getColor, densityBreaks, gdpBreaks, populationBreaks,
} from '@/utils/colorSchemes.js'
import { loadGeoJSON } from '@/utils/geoJsonProcessor.js'

const mapEl = ref(null)
let map = null
let districtLayer = null
let proportionalLayer = null
let legendControl = null
let geojsonData = null

// ===== 状态 =====
const viewMode = ref('choropleth')
const activeField = ref('population')
const activeScheme = ref('YlOrRd')
const filterMin = ref(0)
const hoverInfo = ref(null)

// ===== 字段配置 =====
const fields = [
  { key: 'population', label: '人口', unit: '万人' },
  { key: 'gdp', label: 'GDP', unit: '亿元' },
  { key: 'density', label: '密度', unit: '人/km²' },
]
const activeFieldLabel = ref('人口')
const activeFieldUnit = ref('万人')

const getSchemeColors = () => {
  switch (activeScheme.value) {
    case 'Blues': return sequentialBlues
    case 'RdYlBu': return divergentRdYlBu.slice().reverse()
    default: return sequentialYlOrRd
  }
}

const getFieldBreaks = () => {
  switch (activeField.value) {
    case 'gdp': return gdpBreaks
    case 'density': return densityBreaks
    default: return populationBreaks
  }
}

// ===== 样式函数 =====
const styleFeature = (feature) => {
  const value = feature.properties[activeField.value] || 0
  const colors = getSchemeColors()
  const breaks = getFieldBreaks()
  return {
    fillColor: getColor(value, breaks, colors),
    weight: 2,
    opacity: 1,
    color: '#ffffff',
    dashArray: '3',
    fillOpacity: 0.7,
  }
}

// ===== 交互回调 =====
const highlightFeature = (e) => {
  const layer = e.target
  layer.setStyle({
    weight: 3,
    color: '#333',
    dashArray: '',
    fillOpacity: 0.85,
  })
  layer.bringToFront()

  const p = layer.feature.properties
  hoverInfo.value = {
    name: p.name,
    value: p[activeField.value],
    area: p.area,
    density: p.density,
  }
}

const resetHighlight = (e) => {
  if (districtLayer) districtLayer.resetStyle(e.target)
  hoverInfo.value = null
}

const zoomToFeature = (e) => {
  map.fitBounds(e.target.getBounds(), { padding: [50, 50] })
}

const onEachFeature = (feature, layer) => {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  })
}

// ===== 渲染分级设色图 =====
const renderChoropleth = () => {
  if (districtLayer) map.removeLayer(districtLayer)
  if (proportionalLayer) {
    map.removeLayer(proportionalLayer)
    proportionalLayer = null
  }

  districtLayer = L.geoJSON(geojsonData, {
    style: styleFeature,
    onEachFeature,
    filter: (feature) => {
      return (feature.properties.population || 0) >= filterMin.value
    },
  }).addTo(map)

  updateLegend()
}

// ===== 渲染比例符号图 =====
const renderProportional = () => {
  if (districtLayer) {
    map.removeLayer(districtLayer)
    districtLayer = null
  }
  if (proportionalLayer) map.removeLayer(proportionalLayer)

  // 先渲染底图区县边界
  districtLayer = L.geoJSON(geojsonData, {
    style: {
      fillColor: '#e8e8e8',
      weight: 1,
      color: '#999',
      fillOpacity: 0.3,
    },
    filter: (feature) => {
      return (feature.properties.population || 0) >= filterMin.value
    },
  }).addTo(map)

  // 比例符号 - 用 pointToLayer 在区县中心画圆
  proportionalLayer = L.geoJSON(geojsonData, {
    filter: (feature) => {
      return (feature.properties.population || 0) >= filterMin.value
    },
    pointToLayer: (feature, latlng) => {
      // 从 center 属性获取中心点
      const c = feature.properties.center
      if (c) {
        latlng = L.latLng(c[1], c[0])
      }
      const value = feature.properties[activeField.value] || 0
      const radius = Math.max(8, Math.sqrt(value) * 2.5)
      const colors = getSchemeColors()
      const breaks = getFieldBreaks()
      const color = getColor(value, breaks, colors)

      return L.circleMarker(latlng, {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8,
      })
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties
      layer.bindPopup(`
        <div style="font-size:13px">
          <strong>${p.name}</strong><br/>
          ${activeFieldLabel.value}: ${p[activeField.value]} ${activeFieldUnit.value}
        </div>
      `)
      layer.on({
        mouseover: (e) => {
          e.target.setStyle({ weight: 3, fillOpacity: 1 })
          hoverInfo.value = {
            name: p.name,
            value: p[activeField.value],
            area: p.area,
            density: p.density,
          }
        },
        mouseout: (e) => {
          e.target.setStyle({ weight: 2, fillOpacity: 0.8 })
          hoverInfo.value = null
        },
      })
    },
  }).addTo(map)

  updateLegend()
}

// ===== 图例 =====
const updateLegend = () => {
  if (legendControl) {
    map.removeControl(legendControl)
  }

  const colors = getSchemeColors()
  const breaks = getFieldBreaks()

  legendControl = L.control({ position: 'bottomright' })
  legendControl.onAdd = () => {
    const div = L.DomUtil.create('div', 'legend-control')
    div.innerHTML = `<h4>${activeFieldLabel.value} (${activeFieldUnit.value})</h4>`

    // 构建分级标签
    const labels = []
    labels.push(`<  ${breaks[0]}`)
    for (let i = 0; i < breaks.length - 1; i++) {
      labels.push(`${breaks[i]} - ${breaks[i + 1]}`)
    }
    labels.push(`> ${breaks[breaks.length - 1]}`)

    for (let i = 0; i < colors.length; i++) {
      div.innerHTML += `
        <div class="legend-item">
          <span class="legend-color" style="background:${colors[i]}"></span>
          <span>${labels[i]}</span>
        </div>`
    }
    return div
  }
  legendControl.addTo(map)
}

// ===== 切换函数 =====
const switchView = (mode) => {
  viewMode.value = mode
  refresh()
}

const changeField = (key) => {
  activeField.value = key
  const f = fields.find((x) => x.key === key)
  activeFieldLabel.value = f.label
  activeFieldUnit.value = f.unit
  refresh()
}

const changeScheme = (scheme) => {
  activeScheme.value = scheme
  refresh()
}

const refresh = () => {
  if (!geojsonData) return
  if (viewMode.value === 'choropleth') {
    renderChoropleth()
  } else {
    renderProportional()
  }
}

watch(filterMin, refresh)

// ===== 初始化 =====
onMounted(async () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  map = L.map(mapEl.value).setView([29.56, 106.55], 11)

  const baseMaps = getDefaultBaseMaps()
  baseMaps['高德标准'].addTo(map)
  L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map)
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map)

  map.on('mousemove', (e) => {
    const { lat, lng } = e.latlng
    if (lat >= 29.2 && lat <= 29.95 && lng >= 106.2 && lng <= 106.8) {
      // 在重庆范围内才更新坐标
    }
  })

  // 加载区县数据
  geojsonData = await loadGeoJSON('/data/chongqing-districts.geojson')
  renderChoropleth()

  // 缩放至数据范围
  if (districtLayer) {
    map.fitBounds(districtLayer.getBounds(), { padding: [30, 30] })
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.part2-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.control-panel {
  width: 260px;
}

.control-group {
  margin-bottom: 12px;
}

.control-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.range-input {
  width: 100%;
  accent-color: var(--accent);
}

.scheme-info .info-text {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  line-height: 1.5;
}

.hover-info {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  min-width: 180px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 3px 0;
  gap: 12px;
}

.info-row span {
  color: var(--text-secondary);
}
</style>
