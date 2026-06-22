<!--
  AboutView.vue - 关于页面
  展示项目信息、技术栈说明、架构设计描述
-->
<template>
  <div class="about-view">
    <h2 class="page-title">ℹ️ 关于本项目</h2>

    <section class="info-section">
      <h3>项目简介</h3>
      <p>
        本项目是《GIS工程与开发》课程实验二——Web前端开发基础与GIS应用框架搭建。
        基于 Vite 6 + Vue 3.5 + JavaScript 技术栈，构建了一个包含地图展示、
        图层管理、数据处理、状态管理等功能的城市 GIS 单页应用。
      </p>
    </section>

    <section class="info-section">
      <h3>技术栈</h3>
      <div class="tech-grid">
        <div class="tech-card" v-for="tech in techStack" :key="tech.name">
          <span class="tech-icon">{{ tech.icon }}</span>
          <span class="tech-name">{{ tech.name }}</span>
          <span class="tech-desc">{{ tech.desc }}</span>
        </div>
      </div>
    </section>

    <section class="info-section">
      <h3>项目结构</h3>
      <pre class="code-block">{{ projectStructure }}</pre>
    </section>

    <section class="info-section">
      <h3>实验内容覆盖</h3>
      <ul class="feature-list">
        <li v-for="feat in features" :key="feat.title" class="feature-item">
          <span class="feature-check">✅</span>
          <div>
            <strong>{{ feat.title }}</strong>
            <p class="feature-desc">{{ feat.desc }}</p>
          </div>
        </li>
      </ul>
    </section>

    <section class="info-section">
      <h3>开发者信息</h3>
      <p>姓名：王紫康 | 学号：632306130213 | 学院：智慧城市学院</p>
      <p>专业：地理空间信息工程 2023级</p>
    </section>
  </div>
</template>

<script setup>
/** 技术栈列表 */
const techStack = [
  { icon: '⚡', name: 'Vite 6', desc: '构建工具，极速HMR' },
  { icon: '💚', name: 'Vue 3.5', desc: '组合式API，响应式系统' },
  { icon: '🍍', name: 'Pinia', desc: '全局状态管理' },
  { icon: '🧭', name: 'Vue Router', desc: '路由管理与懒加载' },
  { icon: '🗺️', name: 'Leaflet', desc: '开源地图库' },
  { icon: '📦', name: 'ES6 Modules', desc: '模块化开发' },
]

/** 项目结构 */
const projectStructure = `gis-frontend/
├── src/
│   ├── main.js           # 应用入口
│   ├── App.vue           # 根组件
│   ├── style.css         # 全局样式（CSS变量/主题）
│   ├── stores/
│   │   └── mapStore.js   # Pinia 地图状态管理
│   ├── router/
│   │   └── index.js      # Vue Router 路由配置
│   ├── composables/
│   │   ├── useLayers.js  # 图层管理 Composable
│   │   └── useTheme.js   # 主题切换 Composable
│   ├── utils/
│   │   ├── geoUtils.js         # GIS 工具函数
│   │   ├── geoJsonProcessor.js # GeoJSON 处理模块
│   │   └── layerModel.js       # 图层数据模型(Class)
│   ├── components/
│   │   ├── GisLayout.vue    # 主布局组件
│   │   ├── MapToolbar.vue   # 地图工具栏
│   │   ├── CoordDisplay.vue # 坐标显示
│   │   ├── LayerPanel.vue   # 图层面板
│   │   └── LayerItem.vue    # 图层项
│   └── views/
│       ├── MapView.vue    # 地图页面
│       ├── DataView.vue   # 数据页面
│       └── AboutView.vue  # 关于页面
├── index.html
├── vite.config.js
└── package.json`

/** 功能特性 */
const features = [
  { title: 'HTML5/CSS3 界面布局', desc: '语义化标签 + Flex/Grid 布局、CSS3 过渡悬停效果、深色/浅色主题、响应式适配' },
  { title: 'JavaScript ES6+ 空间数据处理', desc: 'Haversine 距离计算、坐标格式化、GeoJSON 异步加载/解析/过滤/统计、LayerModel Class 封装' },
  { title: 'Vue3 组件化开发', desc: '组合式API坐标显示、v-for图层列表、Props/Emit通信、computed统计、搜索过滤' },
  { title: 'Vue3 进阶集成', desc: 'Pinia mapStore 全局状态、Vue Router 多页面路由、useLayers/useTheme Composables、工具栏联动' },
  { title: '工程化增强', desc: 'Pinia 状态 localStorage 持久化、路由组件懒加载、路由权限守卫预留接口' },
]
</script>

<style scoped>
.about-view {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 22px;
  margin: 0 0 20px;
  color: var(--text-primary);
}

.info-section {
  margin-bottom: 24px;
}

.info-section h3 {
  font-size: 16px;
  margin: 0 0 12px;
  color: var(--text-primary);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
}

.info-section p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* 技术栈网格 */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.tech-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-sidebar);
  transition: transform 0.2s;
}

.tech-card:hover {
  transform: translateY(-2px);
}

.tech-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.tech-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.tech-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* 代码块 */
.code-block {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 16px;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  color: var(--text-secondary);
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 功能列表 */
.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-check {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.feature-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 4px 0 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .about-view {
    padding: 16px;
  }
  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
