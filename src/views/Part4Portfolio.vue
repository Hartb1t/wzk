<!--
  Part4Portfolio.vue - 实验4: 二维综合作品集 (P1)
  功能：整合Leaflet POI + 专题地图 + MapLibre矢量瓦片到统一界面
  支持多标签页切换、信息面板、统一UI风格
-->
<template>
  <div class="portfolio-container">
    <!-- 标签页切换 -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- Leaflet 综合地图 -->
    <div v-show="activeTab === 'leaflet'" class="map-area">
      <div ref="leafletEl" class="map-container"></div>
      <!-- 信息面板 -->
      <div class="side-panel info-panel">
        <h3>📁 个人 GIS 作品集</h3>
        <p class="panel-desc">
          整合作品集展示：重庆主城区兴趣点、区县人口专题图、矢量瓦片可视化。
        </p>

        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-value">{{ poiCount }}</div>
            <div class="stat-label">兴趣点</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ districtCount }}</div>
            <div class="stat-label">区县</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ poiTypes.length }}</div>
            <div class="stat-label">类型</div>
          </div>
        </div>

        <div class="legend-section" v-if="showLegend">
          <h4>图例</h4>
          <div v-for="item in legendData" :key="item.label" class="legend-item">
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span>{{ item.label }}</span>
          </div>
        </div>

        <div class="view-modes">
          <label class="control-label">专题图层</label>
          <div class="btn-group">
            <button
              class="btn"
              :class="{ active: overlayMode === 'none' }"
              @click="setOverlay('none')"
            >仅POI</button>
            <button
              class="btn"
              :class="{ active: overlayMode === 'choropleth' }"
              @click="setOverlay('choropleth')"
            >+ 分级设色</button>
            <button
              class="btn"
              :class="{ active: overlayMode === 'proportional' }"
              @click="setOverlay('proportional')"
            >+ 比例符号</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MapLibre 矢量瓦片 -->
    <div v-show="activeTab === 'maplibre'" class="map-area">
      <div ref="maplibreEl" class="map-container"></div>
      <div class="side-panel info-panel">
        <h3>🌐 矢量瓦片视图</h3>
        <p class="panel-desc">
          基于 MapLibre GL JS 的矢量瓦片渲染，支持数据驱动样式和3D建筑拉伸。
        </p>
        <div class="btn-group" style="margin-top: 8px">
          <button
            class="btn"
            :class="{ active: mlStyle === 'liberty' }"
            @click="switchMlStyle('liberty')"
          >Liberty</button>
          <button
            class="btn"
            :class="{ active: mlStyle === 'dark' }"
            @click="switchMlStyle('dark')"
          >Dark</button>
          <button
            class="btn"
            :class="{ active: mlStyle === 'positron' }"
            @click="switchMlStyle('positron')"
          >Positron</button>
        </div>
        <div class="btn-group" style="margin-top: 8px">
          <button class="btn" @click="toggle3D">
            {{ is3D ? '2D 视图' : '3D 建筑' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 标注编辑器 -->
    <div v-show="activeTab === 'editor'" class="map-area">
      <div ref="editorEl" class="map-container"></div>
      <div class="side-panel editor-panel">
        <h3>✏️ 标注编辑器</h3>
        <p class="panel-desc">点击地图添加标注，支持点、线、面三种类型。右键点击标注可删除。</p>

        <div class="control-group">
          <label class="control-label">绘制类型</label>
          <div class="btn-group">
            <button class="btn" :class="{ active: drawType === 'point' }" @click="setDrawType('point')">📍 点</button>
            <button class="btn" :class="{ active: drawType === 'line' }" @click="setDrawType('line')">📏 线</button>
            <button class="btn" :class="{ active: drawType === 'polygon' }" @click="setDrawType('polygon')">🔲 面</button>
          </div>
        </div>

        <div v-if="drawType !== 'point'" class="control-group">
          <button class="btn" @click="finishDraw" :disabled="drawPoints.length < 2" style="width:100%">
            完成绘制 ({{ drawPoints.length }} 个点)
          </button>
          <button v-if="drawPoints.length" class="btn" @click="cancelDraw" style="width:100%;margin-top:4px">
            取消
          </button>
        </div>

        <div class="control-group" style="margin-top: 10px">
          <label class="control-label">已添加标注 ({{ annotations.length }})</label>
          <div class="annotation-list">
            <div v-for="(ann, i) in annotations" :key="i" class="annotation-item">
              <span>{{ ann.icon }} {{ ann.name }}</span>
              <button class="btn-sm" @click="removeAnnotation(i)" title="删除">✕</button>
            </div>
            <div v-if="!annotations.length" class="empty-hint">暂无标注，点击地图添加</div>
          </div>
        </div>

        <div class="control-group">
          <button class="btn" @click="exportGeoJSON" :disabled="!annotations.length" style="width:100%">
            📥 导出 GeoJSON
          </button>
        </div>
      </div>
    </div>

    <!-- 作品集说明 -->
    <div v-show="activeTab === 'about'" class="about-area">
      <div class="about-content">
        <h2>📁 作品集功能说明</h2>

        <div class="about-section">
          <h3>一、项目概述</h3>
          <p>本作品集是智慧城市学院《GIS工程与开发》课程实验三（WebGIS 二维开发）的综合成果。
            项目基于 Vue 3 + Leaflet 1.9.4 + MapLibre GL JS 技术栈，以重庆市主城区为研究区域，
            实现了 WebGIS 二维地图开发从底图配置、空间数据可视化到矢量瓦片渲染的完整功能链路。
            采用 Composition API + Pinia 状态管理 + Vue Router Hash 模式的现代前端架构，
            支持浅色/深色主题切换，具备部署至 GitHub Pages 的静态发布能力。</p>
        </div>

        <div class="about-section">
          <h3>二、实验模块与功能</h3>

          <h4>🗺️ 模块一：Leaflet 地图与标注交互（15分）</h4>
          <ul>
            <li><strong>多底图切换</strong>：基于高德地图瓦片服务，提供高德标准街道、高德卫星影像（含注记叠加）两种底图，通过 <code>L.control.layers</code> 实现右上角面板切换</li>
            <li><strong>POI 自定义标注</strong>：加载 24 个兴趣点 GeoJSON 数据，使用 <code>pointToLayer</code> + <code>L.divIcon</code> 渲染水滴形自定义图标（按6种类型着色），支持 Popup 弹窗与 Tooltip 悬浮提示</li>
            <li><strong>地图书签定位</strong>：预设解放碑、洪崖洞、南山一棵树、重庆大学、观音桥 5 个地标书签，点击后使用 <code>map.flyTo()</code> 平滑飞行动画定位（duration: 1.5s）</li>
            <li><strong>距离测量工具</strong>：点击地图逐点标记，使用 Haversine 公式计算球面距离，以红色虚线 <code>L.polyline</code>（dashArray: 6,4）连接各点，实时显示总距离（自动切换 m/km 单位）</li>
            <li><strong>比例尺与坐标显示</strong>：左下角 <code>L.control.scale</code> 公制比例尺；鼠标移动实时同步经纬度至 Pinia 状态栏</li>
            <li><strong>POI 类型过滤</strong>：6 种 POI 类型复选框联动，<code>watch</code> 监听变化后重新加载图层</li>
          </ul>

          <h4>📊 模块二：GeoJSON 专题地图（30分）</h4>
          <ul>
            <li><strong>分级设色图（Choropleth）</strong>：加载重庆市 10 个区县 GeoJSON 边界数据，通过 <code>style</code> 回调 + <code>getColor()</code> 分级函数实现人口/GDP/密度的 7 级分级着色，白色虚线边界</li>
            <li><strong>比例符号图（Proportional Symbol）</strong>：使用 <code>pointToLayer</code> 在区县中心点绘制 <code>L.circleMarker</code>，半径公式 <code>r = max(8, √value × 2.5)</code>，面积与属性值成正比</li>
            <li><strong>onEachFeature 交互</strong>：mouseover 高亮加粗（weight: 3, fillOpacity: 0.85）+ mouseout 恢复 + click 缩放至要素边界；右上角信息面板实时显示 hover 区县的人口/GDP/面积/密度</li>
            <li><strong>图例设计</strong>：使用 <code>L.control</code> 自定义控件（bottomright），动态生成 7 级颜色块与分级标签，随字段/配色方案切换自动更新</li>
            <li><strong>数据过滤</strong>：人口阈值滑块（0~300 万），通过 <code>filter</code> 回调动态过滤区县要素</li>
            <li><strong>配色方案</strong>：提供 3 种色阶——YlOrRd（顺序·黄橙红）、Blues（顺序·蓝色渐变）、RdYlBu（发散·红黄蓝），面板底部附配色说明，解释顺序色阶与发散色阶的适用场景</li>
          </ul>

          <h4>🌐 模块三：MapLibre 矢量瓦片可视化（25分）</h4>
          <ul>
            <li><strong>矢量瓦片底图</strong>：基于 OpenFreeMap 提供 Liberty / Bright / Dark / Positron 四种矢量瓦片样式，通过 <code>map.setStyle()</code> 切换，监听 <code>style.load</code> 事件自动重添数据图层</li>
            <li><strong>数据驱动样式</strong>：使用 GeoJSON Source + <code>interpolate</code> 表达式实现 fill-color 连续插值（人口/GDP），线性插值 stops 自动生成</li>
            <li><strong>点聚合（Cluster）</strong>：POI 数据启用 <code>cluster: true</code>，三层图层——聚合圆（step 表达式按数量分级着色/缩放）、聚合数量文本、未聚合散点；点击聚合圆可展开</li>
            <li><strong>3D 建筑挤出</strong>：<code>fill-extrusion</code> 图层渲染渝中半岛模拟建筑数据，高度 20~220m，颜色按高度线性插值（灰→蓝→深蓝），支持 pitch（0~85°）和 bearing（-180~180°）滑块实时调整 3D 视角</li>
          </ul>

          <h4>📁 模块四：综合作品集（15分）</h4>
          <ul>
            <li><strong>统一界面框架</strong>：4 个标签页（Leaflet 综合 / MapLibre / 标注编辑 / 功能说明）整合全部实验模块，统一的侧边面板、按钮组、图例样式</li>
            <li><strong>Leaflet 综合视图</strong>：POI 图层 + 区县专题叠加，支持"仅 POI / + 分级设色 / + 比例符号"三种叠加模式切换</li>
            <li><strong>标注编辑器</strong>：支持点（单击添加 Marker）、线（多点绘制 Polyline）、面（多点绘制 Polygon）三种类型，标注列表管理（删除），一键导出 GeoJSON 文件</li>
            <li><strong>作品集首页</strong>：卡片式布局导航，展示 4 个实验模块的技术栈标签、功能摘要和分值</li>
          </ul>
        </div>

        <div class="about-section">
          <h3>三、数据内容</h3>
          <ul>
            <li><strong>兴趣点（POI）</strong>：重庆主城区 24 个兴趣点，涵盖景点（6）、教育（3）、交通（4）、商业（4）、餐饮（3）、公园（3）共 6 类，包含 name、type、desc、value 属性</li>
            <li><strong>区县边界</strong>：重庆市 10 个主要区县（渝中、江北、南岸、沙坪坝、九龙坡、大渡口、渝北、巴南、北碚、两江新区）的简化多边形边界，附带人口（万人）、GDP（亿元）、面积（km²）、人口密度（人/km²）、中心点坐标</li>
            <li><strong>模拟建筑</strong>：渝中半岛区域随机生成的 30~40 栋建筑轮廓，高度 20~220m，用于 fill-extrusion 3D 拉伸展示</li>
            <li><strong>底图服务</strong>：高德地图瓦片（标准街道 / 卫星影像 + 注记），GCJ-02 坐标系</li>
          </ul>
        </div>

        <div class="about-section">
          <h3>四、配色方案设计说明</h3>
          <ul>
            <li><strong>顺序色阶（Sequential）</strong>：YlOrRd（黄→橙→红）和 Blues（浅蓝→深蓝）适用于人口密度、GDP 等连续递增数据，低值用浅色、高值用深色，符合直觉认知。7 级分级断点根据数据分布设定</li>
            <li><strong>发散色阶（Divergent）</strong>：RdYlBu（红→黄→蓝）适用于增长率、偏差值等正负对比数据，红色代表高值/正增长，蓝色代表低值/负增长，中间黄色为过渡</li>
            <li><strong>双变量色阶（Bivariate）</strong>：3×3 矩阵同时编码两个变量（预留），行和列分别代表两个属性的低→高变化</li>
            <li><strong>POI 类型配色</strong>：6 种类别使用高辨识度独立色相——景点（红）、教育（蓝）、交通（黄）、商业（绿）、餐饮（橙）、公园（翠绿）</li>
          </ul>
        </div>

        <div class="about-section">
          <h3>五、图层结构</h3>
          <ul>
            <li><strong>底图层</strong>：高德标准街道 / 高德卫星影像+注记（Leaflet）；OpenFreeMap Liberty/Bright/Dark/Positron（MapLibre）</li>
            <li><strong>区县面图层</strong>：分级设色填充 + 白色边界线，或灰色底图 + 比例符号圆</li>
            <li><strong>POI 点图层</strong>：自定义 divIcon（水滴形），按类型着色，Popup + Tooltip</li>
            <li><strong>MapLibre 矢量图层</strong>：fill（分级填充）/ cluster（聚合）/ fill-extrusion（3D 建筑挤出）</li>
            <li><strong>标注编辑图层</strong>：Marker / Polyline / Polygon，支持 GeoJSON 导出</li>
          </ul>
        </div>

        <div class="about-section">
          <h3>六、技术架构</h3>
          <ul>
            <li><strong>前端框架</strong>：Vue 3（Composition API, <code>&lt;script setup&gt;</code>）+ Vite 6 构建工具</li>
            <li><strong>状态管理</strong>：Pinia（mapStore 管理地图中心/缩放/主题/鼠标坐标/图层配置）</li>
            <li><strong>路由</strong>：Vue Router Hash 模式（5 个页面路由，便于 GitHub Pages 静态部署）</li>
            <li><strong>地图引擎</strong>：Leaflet 1.9.4（栅格瓦片 + GeoJSON 图层）+ MapLibre GL JS 5.x（矢量瓦片 + WebGL 渲染）</li>
            <li><strong>数据格式</strong>：GeoJSON（FeatureCollection），通过 fetch 加载 <code>/data/</code> 静态资源</li>
            <li><strong>工具函数</strong>：Haversine 球面距离、坐标格式化（DD/DMS）、Shoelace 面积计算、分级设色函数、7 种配色方案定义</li>
            <li><strong>主题系统</strong>：CSS 变量驱动的浅色/深色主题切换，涵盖背景色、文字色、边框色、阴影等 30+ 变量</li>
          </ul>
        </div>

        <div class="about-section">
          <h3>七、交互功能汇总</h3>
          <div class="feature-table">
            <div class="feature-row" v-for="f in featureList" :key="f.name">
              <span class="feature-name">{{ f.name }}</span>
              <span class="feature-module">{{ f.module }}</span>
              <span class="feature-desc">{{ f.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getDefaultBaseMaps, createAmapNormalLayer } from '@/utils/tiandituLayers.js'
import { poiTypeColors, sequentialYlOrRd, getColor, populationBreaks } from '@/utils/colorSchemes.js'
import { loadGeoJSON } from '@/utils/geoJsonProcessor.js'

const tabs = [
  { key: 'leaflet', label: 'Leaflet 综合', icon: '🗺️' },
  { key: 'maplibre', label: 'MapLibre', icon: '🌐' },
  { key: 'editor', label: '标注编辑', icon: '✏️' },
  { key: 'about', label: '功能说明', icon: 'ℹ️' },
]
const activeTab = ref('leaflet')

const leafletEl = ref(null)
const maplibreEl = ref(null)
const editorEl = ref(null)
let leafletMap = null
let maplibreMap = null
let editorMap = null

const poiCount = ref(0)
const districtCount = ref(0)
const poiTypes = Object.keys(poiTypeColors)
const overlayMode = ref('none')
const showLegend = ref(true)
const mlStyle = ref('liberty')
const is3D = ref(false)

// 图例数据
const legendData = Object.entries(poiTypeColors).map(([label, color]) => ({ label, color }))

const featureList = [
  { name: '多底图切换', module: '模块一', desc: '高德标准/卫星双底图，L.control.layers 面板切换' },
  { name: 'POI 自定义标注', module: '模块一', desc: 'pointToLayer + divIcon 水滴图标，Popup + Tooltip' },
  { name: '地图书签定位', module: '模块一', desc: '5 个预设地标，map.flyTo() 平滑飞行动画' },
  { name: '距离测量工具', module: '模块一', desc: 'Haversine 球面距离，红色虚线折线 + 距离标注' },
  { name: '比例尺 + 坐标显示', module: '模块一', desc: 'L.control.scale 公制比例尺 + 鼠标经纬度实时显示' },
  { name: 'POI 类型过滤', module: '模块一', desc: '6 种类型复选框联动，watch 监听重载图层' },
  { name: '分级设色图', module: '模块二', desc: '7 级分级着色，getColor() + style 回调' },
  { name: '比例符号图', module: '模块二', desc: 'circleMarker 面积与属性值成正比' },
  { name: '自定义图例', module: '模块二', desc: 'L.control 控件，动态颜色块 + 分级标签' },
  { name: '数据过滤', module: '模块二', desc: '人口阈值滑块，filter 回调动态过滤' },
  { name: '配色方案说明', module: '模块二', desc: '顺序色阶 YlOrRd/Blues + 发散色阶 RdYlBu' },
  { name: '矢量瓦片底图', module: '模块三', desc: 'OpenFreeMap 四种样式，setStyle 切换' },
  { name: '数据驱动样式', module: '模块三', desc: 'interpolate 表达式连续插值' },
  { name: '点聚合', module: '模块三', desc: 'cluster: true，聚合圆 + 数量文本 + 散点' },
  { name: '3D 建筑挤出', module: '模块三', desc: 'fill-extrusion，pitch/bearing 视角控制' },
  { name: '标注编辑器', module: '模块四', desc: '点/线/面绘制，列表管理，GeoJSON 导出' },
  { name: '主题切换', module: '全局', desc: 'CSS 变量驱动浅色/深色模式' },
]

let poiLayer = null
let districtLayer = null
let propLayer = null

const mlStyles = {
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
  positron: 'https://tiles.openfreemap.org/styles/positron',
}

const switchTab = (key) => {
  activeTab.value = key
  if (key === 'maplibre' && !maplibreMap && maplibreEl.value) {
    initMapLibre()
  }
  if (key === 'editor' && !editorMap && editorEl.value) {
    initEditor()
  }
  // 切换后刷新地图尺寸
  setTimeout(() => {
    if (leafletMap) leafletMap.invalidateSize()
    if (maplibreMap) maplibreMap.resize()
    if (editorMap) editorMap.invalidateSize()
  }, 100)
}

// ===== Leaflet 地图 =====
const initLeaflet = async () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  leafletMap = L.map(leafletEl.value).setView([29.56, 106.55], 12)

  const baseMaps = getDefaultBaseMaps()
  baseMaps['高德标准'].addTo(leafletMap)
  L.control.layers(baseMaps, null, { position: 'topright' }).addTo(leafletMap)
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(leafletMap)

  // 加载POI
  const pois = await loadGeoJSON('/data/pois.geojson')
  poiCount.value = pois.features.length

  poiLayer = L.geoJSON(pois, {
    pointToLayer: (feature, latlng) => {
      const color = poiTypeColors[feature.properties.type] || '#999'
      return L.divIcon({
        className: 'custom-poi-icon',
        html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:#fff;font-size:10px;font-weight:bold;">${feature.properties.type[0]}</span></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      })
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties
      const color = poiTypeColors[p.type] || '#999'
      layer.bindPopup(`<div class="poi-popup"><h3>${p.name}</h3><span class="popup-type" style="background:${color}22;color:${color}">${p.type}</span><p class="popup-desc">${p.desc}</p></div>`)
      layer.bindTooltip(p.name, { direction: 'top', offset: [0, -26] })
    },
  }).addTo(leafletMap)

  // 加载区县数据
  const districts = await loadGeoJSON('/data/chongqing-districts.geojson')
  districtCount.value = districts.features.length

  // 初始不显示区县专题
}

const setOverlay = async (mode) => {
  overlayMode.value = mode

  // 清除已有专题
  if (districtLayer) { leafletMap.removeLayer(districtLayer); districtLayer = null }
  if (propLayer) { leafletMap.removeLayer(propLayer); propLayer = null }

  if (mode === 'none') return

  const districts = await loadGeoJSON('/data/chongqing-districts.geojson')

  if (mode === 'choropleth') {
    districtLayer = L.geoJSON(districts, {
      style: (feature) => {
        const val = feature.properties.population || 0
        return {
          fillColor: getColor(val, populationBreaks, sequentialYlOrRd),
          weight: 2, opacity: 1, color: '#fff', fillOpacity: 0.5,
        }
      },
      onEachFeature: (feature, layer) => {
        layer.on({
          mouseover: (e) => {
            e.target.setStyle({ weight: 3, fillOpacity: 0.7 })
            e.target.bringToFront()
            if (poiLayer) poiLayer.bringToFront()
          },
          mouseout: (e) => districtLayer.resetStyle(e.target),
        })
        layer.bindTooltip(`<strong>${feature.properties.name}</strong><br/>人口: ${feature.properties.population}万`, { sticky: true })
      },
    }).addTo(leafletMap)
    districtLayer.bringToBack()
  } else if (mode === 'proportional') {
    districtLayer = L.geoJSON(districts, {
      style: { fillColor: '#e8e8e8', weight: 1, color: '#999', fillOpacity: 0.2 },
    }).addTo(leafletMap)
    districtLayer.bringToBack()

    propLayer = L.geoJSON(districts, {
      pointToLayer: (feature, latlng) => {
        const c = feature.properties.center
        if (c) latlng = L.latLng(c[1], c[0])
        const val = feature.properties.population || 0
        const radius = Math.max(6, Math.sqrt(val) * 2)
        return L.circleMarker(latlng, {
          radius, fillColor: '#fc4e2a', color: '#fff', weight: 2, fillOpacity: 0.7,
        })
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(`${feature.properties.name}: ${feature.properties.population}万人`)
      },
    }).addTo(leafletMap)
  }
}

// ===== MapLibre =====
const initMapLibre = async () => {
  const data = await fetch('/data/chongqing-districts.geojson').then((r) => r.json())

  maplibreMap = new maplibregl.Map({
    container: maplibreEl.value,
    style: mlStyles.liberty,
    center: [106.55, 29.56],
    zoom: 11,
  })

  maplibreMap.addControl(new maplibregl.NavigationControl(), 'top-right')
  maplibreMap.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

  maplibreMap.on('load', () => {
    maplibreMap.addSource('districts', { type: 'geojson', data })
    maplibreMap.addLayer({
      id: 'district-fill',
      type: 'fill',
      source: 'districts',
      paint: {
        'fill-color': ['interpolate', ['linear'], ['get', 'population'],
          42, '#ffffcc', 80, '#fed976', 120, '#feb24c',
          160, '#fd8d3c', 200, '#fc4e2a', 250, '#e31a1c', 300, '#800026',
        ],
        'fill-opacity': 0.5,
      },
    })
    maplibreMap.addLayer({
      id: 'district-line',
      type: 'line',
      source: 'districts',
      paint: { 'line-color': '#fff', 'line-width': 1.5 },
    })
    maplibreMap.addLayer({
      id: 'district-label',
      type: 'symbol',
      source: 'districts',
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 12,
      },
      paint: { 'text-color': '#333', 'text-halo-color': '#fff', 'text-halo-width': 1 },
    })
  })

  maplibreMap.on('style.load', () => {
    if (maplibreMap.getSource('districts')) return
    const fetch2 = fetch('/data/chongqing-districts.geojson').then((r) => r.json())
    fetch2.then((data) => {
      maplibreMap.addSource('districts', { type: 'geojson', data })
      maplibreMap.addLayer({
        id: 'district-fill', type: 'fill', source: 'districts',
        paint: {
          'fill-color': ['interpolate', ['linear'], ['get', 'population'],
            42, '#ffffcc', 80, '#fed976', 120, '#feb24c',
            160, '#fd8d3c', 200, '#fc4e2a', 250, '#e31a1c', 300, '#800026',
          ],
          'fill-opacity': 0.5,
        },
      })
      maplibreMap.addLayer({
        id: 'district-line', type: 'line', source: 'districts',
        paint: { 'line-color': '#fff', 'line-width': 1.5 },
      })
    })
  })
}

const switchMlStyle = (key) => {
  mlStyle.value = key
  if (maplibreMap) {
    maplibreMap.setStyle(mlStyles[key])
  }
}

const toggle3D = () => {
  is3D.value = !is3D.value
  if (maplibreMap) {
    if (is3D.value) {
      maplibreMap.setPitch(60)
      maplibreMap.setBearing(30)
      // 添加3D建筑
      if (!maplibreMap.getSource('buildings3d')) {
        const buildings = generateSimpleBuildings()
        maplibreMap.addSource('buildings3d', { type: 'geojson', data: buildings })
        maplibreMap.addLayer({
          id: 'building-extrude',
          type: 'fill-extrusion',
          source: 'buildings3d',
          paint: {
            'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'height'],
              20, '#e8e8e8', 80, '#74add1', 150, '#4575b4', 250, '#313695',
            ],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.8,
          },
        })
      }
    } else {
      maplibreMap.setPitch(0)
      maplibreMap.setBearing(0)
      if (maplibreMap.getLayer('building-extrude')) {
        maplibreMap.removeLayer('building-extrude')
      }
      if (maplibreMap.getSource('buildings3d')) {
        maplibreMap.removeSource('buildings3d')
      }
    }
  }
}

const generateSimpleBuildings = () => {
  const features = []
  for (let i = 0; i < 30; i++) {
    const lng = 106.57 + (Math.random() - 0.5) * 0.03
    const lat = 29.556 + (Math.random() - 0.5) * 0.02
    const w = 0.0004 + Math.random() * 0.0008
    const h = 0.0004 + Math.random() * 0.0008
    features.push({
      type: 'Feature',
      properties: { height: 20 + Math.random() * 200 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[lng - w, lat - h], [lng + w, lat - h], [lng + w, lat + h], [lng - w, lat + h], [lng - w, lat - h]]],
      },
    })
  }
  return { type: 'FeatureCollection', features }
}

// ===== 标注编辑器 =====
const drawType = ref('point')
const drawPoints = ref([])
const annotations = ref([])
let drawLayer = null
let tempLine = null
let tempMarkers = []

const setDrawType = (type) => {
  drawType.value = type
  cancelDraw()
}

const initEditor = () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  editorMap = L.map(editorEl.value).setView([29.56, 106.55], 13)
  createAmapNormalLayer().addTo(editorMap)
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(editorMap)

  drawLayer = L.layerGroup().addTo(editorMap)

  editorMap.on('click', onEditorClick)
  editorMap.getContainer().addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })
}

const onEditorClick = (e) => {
  const { lat, lng } = e.latlng

  if (drawType.value === 'point') {
    const name = `标注点 ${annotations.value.length + 1}`
    const marker = L.marker([lat, lng]).addTo(drawLayer)
      .bindPopup(`<strong>${name}</strong><br/>${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      .openPopup()
    annotations.value.push({
      name, icon: '📍', type: 'Point',
      layer: marker,
      geojson: { type: 'Feature', properties: { name }, geometry: { type: 'Point', coordinates: [lng, lat] } },
    })
  } else {
    drawPoints.value.push([lng, lat])
    const m = L.circleMarker([lat, lng], { radius: 5, color: '#3b82f6', fillColor: '#fff', fillOpacity: 1, weight: 2 }).addTo(drawLayer)
    tempMarkers.push(m)
    if (drawPoints.value.length > 1) {
      if (tempLine) drawLayer.removeLayer(tempLine)
      tempLine = L.polyline(drawPoints.value.map(([lo, la]) => [la, lo]), { color: '#3b82f6', dashArray: '6,4' }).addTo(drawLayer)
    }
  }
}

const finishDraw = () => {
  if (drawPoints.value.length < 2) return

  const type = drawType.value
  const name = `${type === 'line' ? '线' : '面'} ${annotations.value.length + 1}`

  // 清除临时标记
  tempMarkers.forEach((m) => drawLayer.removeLayer(m))
  if (tempLine) drawLayer.removeLayer(tempLine)
  tempMarkers = []
  tempLine = null

  let layer, geojson
  if (type === 'line') {
    const latlngs = drawPoints.value.map(([lo, la]) => [la, lo])
    layer = L.polyline(latlngs, { color: '#e74c3c', weight: 3 }).addTo(drawLayer)
    geojson = { type: 'Feature', properties: { name }, geometry: { type: 'LineString', coordinates: [...drawPoints.value] } }
  } else {
    const latlngs = drawPoints.value.map(([lo, la]) => [la, lo])
    layer = L.polygon(latlngs, { color: '#2ecc71', fillColor: '#2ecc71', fillOpacity: 0.3, weight: 2 }).addTo(drawLayer)
    const closed = [...drawPoints.value, drawPoints.value[0]]
    geojson = { type: 'Feature', properties: { name }, geometry: { type: 'Polygon', coordinates: [closed] } }
  }

  layer.bindPopup(`<strong>${name}</strong>`)
  annotations.value.push({ name, icon: type === 'line' ? '📏' : '🔲', type, layer, geojson })
  drawPoints.value = []
}

const cancelDraw = () => {
  tempMarkers.forEach((m) => drawLayer.removeLayer(m))
  if (tempLine) drawLayer.removeLayer(tempLine)
  tempMarkers = []
  tempLine = null
  drawPoints.value = []
}

const removeAnnotation = (index) => {
  const ann = annotations.value[index]
  if (ann.layer) drawLayer.removeLayer(ann.layer)
  annotations.value.splice(index, 1)
}

const exportGeoJSON = () => {
  const data = {
    type: 'FeatureCollection',
    features: annotations.value.map((a) => a.geojson),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'annotations.geojson'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  initLeaflet()
})

onUnmounted(() => {
  if (leafletMap) { leafletMap.remove(); leafletMap = null }
  if (maplibreMap) { maplibreMap.remove(); maplibreMap = null }
  if (editorMap) { editorMap.remove(); editorMap = null }
})
</script>

<style scoped>
.portfolio-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-bar {
  display: flex;
  background: var(--bg-sidebar);
  border-bottom: 1px solid var(--border-color);
  padding: 0 8px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 500;
}

.map-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.about-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.about-content {
  max-width: 700px;
  margin: 0 auto;
}

.about-content h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.about-section {
  margin-bottom: 20px;
}

.about-section h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 6px;
}

.about-section p,
.about-section li {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.about-section ul {
  padding-left: 20px;
}

.about-section li {
  margin-bottom: 4px;
}

.info-panel {
  width: 240px;
}

.panel-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.stat-item {
  text-align: center;
  padding: 8px 4px;
  background: var(--bg-hover);
  border-radius: 6px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
}

.legend-section {
  margin-bottom: 14px;
}

.legend-section h4 {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-primary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 2px 0;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.view-modes {
  margin-top: 8px;
}

.control-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

/* 编辑器面板 */
.editor-panel {
  width: 260px;
}

.control-group {
  margin-bottom: 10px;
}

.annotation-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-top: 4px;
}

.annotation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  font-size: 13px;
  border-bottom: 1px solid var(--border-color);
}

.annotation-item:last-child {
  border-bottom: none;
}

.btn-sm {
  background: none;
  border: none;
  color: var(--danger);
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.btn-sm:hover {
  background: rgba(239, 68, 68, 0.1);
}

.empty-hint {
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
}

/* 功能汇总表 */
.feature-table {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  margin-top: 8px;
}

.feature-row {
  display: grid;
  grid-template-columns: 130px 60px 1fr;
  gap: 8px;
  padding: 7px 12px;
  font-size: 12px;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
}

.feature-row:last-child {
  border-bottom: none;
}

.feature-name {
  font-weight: 600;
  color: var(--text-primary);
}

.feature-module {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--accent-bg);
  color: var(--accent);
  text-align: center;
}

.feature-desc {
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 小标题 h4 */
.about-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 14px 0 6px;
}

.about-section code {
  font-size: 12px;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--bg-hover);
  color: var(--accent);
}
</style>
