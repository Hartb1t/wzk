<!--
  Part3MapLibre.vue - 实验3: MapLibre 矢量瓦片可视化
  功能：矢量瓦片底图、数据驱动样式、样式切换器、点聚合、3D建筑挤出
-->
<template>
  <div class="part3-container">
    <div ref="mapEl" class="map-container"></div>

    <!-- 左上控制面板 -->
    <div class="side-panel control-panel">
      <h3>🌐 MapLibre 控制</h3>

      <!-- 底图样式切换 -->
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

      <!-- 可视化模式 -->
      <div class="control-group">
        <label class="control-label">可视化模式</label>
        <div class="btn-group">
          <button
            class="btn"
            :class="{ active: vizMode === 'fill' }"
            @click="switchViz('fill')"
          >分级填充</button>
          <button
            class="btn"
            :class="{ active: vizMode === 'cluster' }"
            @click="switchViz('cluster')"
          >点聚合</button>
          <button
            class="btn"
            :class="{ active: vizMode === '3d' }"
            @click="switchViz('3d')"
          >3D 建筑</button>
        </div>
      </div>

      <!-- 配色方案 -->
      <div class="control-group">
        <label class="control-label">数据字段</label>
        <div class="btn-group">
          <button
            class="btn"
            :class="{ active: activeField === 'population' }"
            @click="changeField('population')"
          >人口</button>
          <button
            class="btn"
            :class="{ active: activeField === 'gdp' }"
            @click="changeField('gdp')"
          >GDP</button>
        </div>
      </div>

      <!-- 3D 视角控制 -->
      <div v-if="vizMode === '3d'" class="control-group">
        <label class="control-label">视角倾斜: {{ pitch }}°</label>
        <input
          type="range" min="0" max="85" step="5"
          v-model.number="pitch"
          class="range-input"
          @input="updatePitch"
        />
        <label class="control-label">旋转角度: {{ bearing }}°</label>
        <input
          type="range" min="-180" max="180" step="10"
          v-model.number="bearing"
          class="range-input"
          @input="updateBearing"
        />
      </div>
    </div>

    <!-- 图例 -->
    <div class="maplibre-legend" v-if="vizMode === 'fill'">
      <h4>{{ activeField === 'population' ? '人口 (万人)' : 'GDP (亿元)' }}</h4>
      <div v-for="(item, i) in legendItems" :key="i" class="legend-item">
        <span class="legend-color" :style="{ background: item.color }"></span>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const mapEl = ref(null)
let map = null

// ===== 底图样式配置 =====
const styles = [
  { key: 'liberty', label: 'Liberty', url: 'https://tiles.openfreemap.org/styles/liberty' },
  { key: 'bright', label: 'Bright', url: 'https://tiles.openfreemap.org/styles/bright' },
  { key: 'dark', label: 'Dark', url: 'https://tiles.openfreemap.org/styles/dark' },
  { key: 'positron', label: 'Positron', url: 'https://tiles.openfreemap.org/styles/positron' },
]
const activeStyle = ref('liberty')
const vizMode = ref('fill')
const activeField = ref('population')
const pitch = ref(60)
const bearing = ref(30)

// ===== 数据 =====
let districtData = null
let poiData = null

// ===== 颜色插值 stops =====
const getFieldStops = () => {
  if (activeField.value === 'gdp') {
    return [
      320, '#ffffcc',
      800, '#fed976',
      1200, '#feb24c',
      1800, '#fd8d3c',
      2500, '#fc4e2a',
      4000, '#e31a1c',
      5000, '#800026',
    ]
  }
  return [
    42, '#ffffcc',
    80, '#fed976',
    120, '#feb24c',
    160, '#fd8d3c',
    200, '#fc4e2a',
    250, '#e31a1c',
    300, '#800026',
  ]
}

const legendItems = computed(() => {
  const stops = getFieldStops()
  const items = []
  for (let i = 0; i < stops.length; i += 2) {
    items.push({
      color: stops[i + 1],
      label: `≥ ${stops[i]}`,
    })
  }
  return items.reverse()
})

// ===== 添加数据源和图层 =====
const addDistrictLayers = () => {
  if (!map.getSource('districts')) {
    map.addSource('districts', {
      type: 'geojson',
      data: districtData,
    })
  }

  // 填充图层 - 数据驱动样式
  map.addLayer({
    id: 'districts-fill',
    type: 'fill',
    source: 'districts',
    paint: {
      'fill-color': [
        'interpolate', ['linear'], ['get', activeField.value],
        ...getFieldStops(),
      ],
      'fill-opacity': 0.6,
    },
  })

  // 边界线
  map.addLayer({
    id: 'districts-line',
    type: 'line',
    source: 'districts',
    paint: {
      'line-color': '#ffffff',
      'line-width': 1.5,
    },
  })

  // 区县名标注
  map.addLayer({
    id: 'districts-label',
    type: 'symbol',
    source: 'districts',
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 12,
      'text-anchor': 'center',
    },
    paint: {
      'text-color': '#333',
      'text-halo-color': '#fff',
      'text-halo-width': 1,
    },
  })
}

const addClusterLayers = () => {
  if (!map.getSource('pois')) {
    map.addSource('pois', {
      type: 'geojson',
      data: poiData,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })
  }

  // 聚合圆 - 外层
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'pois',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step', ['get', 'point_count'],
        '#51bbd6', 10,
        '#f1f075', 30,
        '#f28cb1',
      ],
      'circle-radius': [
        'step', ['get', 'point_count'],
        15, 10,
        20, 30,
        25,
      ],
      'circle-opacity': 0.8,
    },
  })

  // 聚合数量文本
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'pois',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#333',
    },
  })

  // 未聚合的点
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'pois',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#e74c3c',
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  })

  // 未聚合点标注
  map.addLayer({
    id: 'unclustered-label',
    type: 'symbol',
    source: 'pois',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 11,
      'text-offset': [0, 1.2],
      'text-anchor': 'top',
    },
    paint: {
      'text-color': '#333',
      'text-halo-color': '#fff',
      'text-halo-width': 1,
    },
  })
}

const add3DBuildingLayers = () => {
  // 使用区县数据模拟建筑挤出
  if (!map.getSource('buildings')) {
    // 生成模拟建筑数据
    const buildings = generateBuildings()
    map.addSource('buildings', {
      type: 'geojson',
      data: buildings,
    })
  }

  map.addLayer({
    id: 'buildings-extrusion',
    type: 'fill-extrusion',
    source: 'buildings',
    paint: {
      'fill-extrusion-color': [
        'interpolate', ['linear'], ['get', 'height'],
        20, '#e8e8e8',
        50, '#74add1',
        100, '#4575b4',
        200, '#313695',
      ],
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.8,
      'fill-extrusion-vertical-gradient': true,
    },
  })
}

// 生成模拟建筑 GeoJSON 数据
const generateBuildings = () => {
  const features = []
  const centerLng = 106.575
  const centerLat = 29.558
  const size = 0.003

  for (let i = 0; i < 40; i++) {
    const lng = centerLng + (Math.random() - 0.5) * 0.04
    const lat = centerLat + (Math.random() - 0.5) * 0.03
    const w = 0.0005 + Math.random() * 0.001
    const h = 0.0005 + Math.random() * 0.001
    const height = 20 + Math.random() * 200

    features.push({
      type: 'Feature',
      properties: { height, name: `建筑${i + 1}` },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [lng - w, lat - h],
          [lng + w, lat - h],
          [lng + w, lat + h],
          [lng - w, lat + h],
          [lng - w, lat - h],
        ]],
      },
    })
  }
  return { type: 'FeatureCollection', features }
}

// ===== 清除图层 =====
const removeDataLayers = () => {
  const layers = [
    'districts-fill', 'districts-line', 'districts-label',
    'clusters', 'cluster-count', 'unclustered-point', 'unclustered-label',
    'buildings-extrusion',
  ]
  layers.forEach((id) => {
    if (map.getLayer(id)) map.removeLayer(id)
  })
}

// ===== 切换函数 =====
const switchStyle = (key) => {
  activeStyle.value = key
  const style = styles.find((s) => s.key === key)
  map.setStyle(style.url)
}

const switchViz = (mode) => {
  vizMode.value = mode
  refreshLayers()
}

const changeField = (field) => {
  activeField.value = field
  if (vizMode.value === 'fill' && map.getLayer('districts-fill')) {
    map.setPaintProperty('districts-fill', 'fill-color', [
      'interpolate', ['linear'], ['get', field],
      ...getFieldStops(),
    ])
  }
}

const updatePitch = () => {
  map.setPitch(pitch.value)
}

const updateBearing = () => {
  map.setBearing(bearing.value)
}

const refreshLayers = () => {
  removeDataLayers()

  if (vizMode.value === 'fill') {
    addDistrictLayers()
    map.setPitch(0)
    map.setBearing(0)
    pitch.value = 0
    bearing.value = 0
  } else if (vizMode.value === 'cluster') {
    addClusterLayers()
    map.setPitch(0)
    map.setBearing(0)
    pitch.value = 0
    bearing.value = 0
  } else if (vizMode.value === '3d') {
    add3DBuildingLayers()
    map.setPitch(pitch.value)
    map.setBearing(bearing.value)
  }
}

// ===== 初始化 =====
onMounted(async () => {
  // 加载数据
  const [distResp, poiResp] = await Promise.all([
    fetch('/data/chongqing-districts.geojson').then((r) => r.json()),
    fetch('/data/pois.geojson').then((r) => r.json()),
  ])
  districtData = distResp
  poiData = poiResp

  map = new maplibregl.Map({
    container: mapEl.value,
    style: styles[0].url,
    center: [106.55, 29.56],
    zoom: 11,
    pitch: 0,
    bearing: 0,
  })

  map.addControl(new maplibregl.NavigationControl(), 'top-right')
  map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

  map.on('load', () => {
    refreshLayers()
  })

  // 样式切换后需要重新添加图层
  map.on('style.load', () => {
    // style.load 事件在 setStyle 后触发
    if (map.isStyleLoaded()) {
      refreshLayers()
    }
  })

  // 聚合点击展开
  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    const clusterId = features[0].properties.cluster_id
    const source = map.getSource('pois')
    if (source) {
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom,
        })
      })
    }
  })

  // 鼠标悬停效果
  map.on('mouseenter', 'clusters', () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', 'clusters', () => {
    map.getCanvas().style.cursor = ''
  })
  map.on('mouseenter', 'unclustered-point', () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', 'unclustered-point', () => {
    map.getCanvas().style.cursor = ''
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
.part3-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.control-panel {
  width: 240px;
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
  margin-bottom: 6px;
}

.maplibre-legend {
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
  line-height: 1.8;
}

.maplibre-legend h4 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 18px;
  height: 14px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}
</style>
