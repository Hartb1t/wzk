<!--
  Home.vue - 作品集首页
  卡片式布局展示4个实验模块，作为个人GIS作品集入口
-->
<template>
  <div class="home-page">
    <div class="hero-section">
      <h1 class="hero-title">🌍 WebGIS 二维开发实验</h1>
      <p class="hero-subtitle">
        基于 Vue 3 + Leaflet 1.9 + MapLibre GL JS 的 GIS 作品集
      </p>
      <p class="hero-desc">
        智慧城市学院 · GIS工程与开发 · 实验三
      </p>
    </div>

    <div class="cards-grid">
      <div
        v-for="card in cards"
        :key="card.path"
        class="card"
        @click="$router.push(card.path)"
      >
        <div class="card-icon">{{ card.icon }}</div>
        <div class="card-body">
          <h3 class="card-title">{{ card.title }}</h3>
          <p class="card-desc">{{ card.desc }}</p>
          <div class="card-tags">
            <span v-for="tag in card.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="card-footer">
            <span class="card-score">{{ card.score }}</span>
            <span class="card-action">进入 →</span>
          </div>
        </div>
      </div>
    </div>

    <div class="tech-section">
      <h2>技术栈</h2>
      <div class="tech-list">
        <span class="tech-badge" v-for="tech in techs" :key="tech">{{ tech }}</span>
      </div>
    </div>

    <div class="features-section">
      <h2>功能说明</h2>
      <div class="features-grid">
        <div class="feature-item" v-for="f in features" :key="f.title">
          <span class="feature-icon">{{ f.icon }}</span>
          <div>
            <h4>{{ f.title }}</h4>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const cards = [
  {
    path: '/part1',
    icon: '🗺️',
    title: 'Leaflet 地图与标注',
    desc: '多底图切换、POI自定义标注、地图书签定位、距离测量工具、比例尺与坐标显示',
    tags: ['Leaflet 1.9', '高德地图', '交互'],
    score: '15分',
  },
  {
    path: '/part2',
    icon: '📊',
    title: 'GeoJSON 专题地图',
    desc: '区县分级设色图、比例符号图、数据过滤、图例设计、顺序/发散色阶配色方案',
    tags: ['GeoJSON', '分级设色', '图例'],
    score: '30分',
  },
  {
    path: '/part3',
    icon: '🌐',
    title: 'MapLibre 矢量瓦片',
    desc: '矢量瓦片底图渲染、数据驱动样式、样式切换器、点聚合、3D建筑挤出',
    tags: ['MapLibre GL', '矢量瓦片', '3D'],
    score: '25分',
  },
  {
    path: '/part4',
    icon: '📁',
    title: '综合作品集',
    desc: '整合全部功能模块的个人GIS作品集，统一界面风格与交互体验',
    tags: ['作品集', '综合', '部署'],
    score: '15分',
  },
]

const techs = [
  'Vue 3', 'Vite', 'Pinia', 'Vue Router',
  'Leaflet 1.9.4', 'MapLibre GL JS',
  'GeoJSON', '高德地图',
]

const features = [
  { icon: '🗂️', title: '图层管理', desc: '统一的图层面板，支持显隐控制和透明度调节' },
  { icon: '📍', title: '坐标显示', desc: '底部状态栏实时显示鼠标经纬度坐标' },
  { icon: '🎨', title: '主题切换', desc: '支持浅色/深色主题切换，CSS变量驱动' },
  { icon: '📏', title: '距离测量', desc: '基于 Haversine 公式的球面距离测量工具' },
  { icon: '🔍', title: '地图书签', desc: '预定义地标快速定位，平滑飞行动画' },
  { icon: '📊', title: '专题地图', desc: '分级设色 + 比例符号 + 自定义图例' },
]
</script>

<style scoped>
.home-page {
  padding: 32px 24px;
  max-width: 960px;
  margin: 0 auto;
  overflow-y: auto;
  height: 100%;
}

.hero-section {
  text-align: center;
  padding: 24px 0 32px;
}

.hero-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.hero-subtitle {
  font-size: 15px;
  color: var(--accent);
  margin-bottom: 4px;
}

.hero-desc {
  font-size: 13px;
  color: var(--text-muted);
}

/* 卡片网格 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  gap: 16px;
}

.card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 36px;
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-bg);
  border-radius: 12px;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.card-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 8px;
}

.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.tag {
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-score {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
}

.card-action {
  font-size: 12px;
  color: var(--accent);
  font-weight: 500;
}

/* 技术栈 */
.tech-section {
  margin-bottom: 28px;
}

.tech-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.tech-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tech-badge {
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 500;
}

/* 功能说明 */
.features-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.feature-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.feature-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.feature-item h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.feature-item p {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
