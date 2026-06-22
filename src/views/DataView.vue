<!--
  DataView.vue - 数据管理页面
  展示图层数据统计信息，使用 useLayers Composable
  演示 ES6+ 数据处理与 async/await 异步加载
-->
<template>
  <div class="data-view">
    <h2 class="page-title">📊 数据管理</h2>

    <!-- 图层统计概览 -->
    <section class="stats-section">
      <h3>图层统计</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ totalCount }}</span>
          <span class="stat-label">图层总数</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ visibleCount }}</span>
          <span class="stat-label">可见图层</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ geojsonCount }}</span>
          <span class="stat-label">GeoJSON 图层</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ tileCount }}</span>
          <span class="stat-label">瓦片图层</span>
        </div>
      </div>
    </section>

    <!-- 图层详情列表 -->
    <section class="detail-section">
      <h3>图层详情</h3>
      <div class="detail-table">
        <div class="table-header">
          <span class="col-name">名称</span>
          <span class="col-type">类型</span>
          <span class="col-visible">可见</span>
          <span class="col-opacity">透明度</span>
          <span class="col-status">状态</span>
        </div>
        <div
          v-for="layer in mapStore.layerConfigs"
          :key="layer.id"
          class="table-row"
        >
          <span class="col-name">{{ layer.name }}</span>
          <span class="col-type">{{ layer.type }}</span>
          <span class="col-visible">{{ layer.visible ? '✅' : '❌' }}</span>
          <span class="col-opacity">{{ Math.round(layer.opacity * 100) }}%</span>
          <span class="col-status" :class="{ active: layer.visible }">
            {{ layer.visible ? '激活' : '隐藏' }}
          </span>
        </div>
      </div>
    </section>

    <!-- 按类型分组 -->
    <section class="group-section">
      <h3>按类型分组</h3>
      <div v-for="(layers, type) in layersByType" :key="type" class="type-group">
        <h4 class="type-title">{{ type }} ({{ layers.length }})</h4>
        <ul class="type-list">
          <li v-for="layer in layers" :key="layer.id" class="type-item">
            {{ layer.name }} — {{ layer.visible ? '可见' : '隐藏' }}
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMapStore } from '@/stores/mapStore.js'
import { useLayers } from '@/composables/useLayers.js'

const mapStore = useMapStore()
const { visibleCount, totalCount, layersByType } = useLayers()

/** GeoJSON 图层数量 */
const geojsonCount = computed(
  () => mapStore.layerConfigs.filter((l) => l.type === 'geojson').length
)

/** 瓦片图层数量 */
const tileCount = computed(
  () => mapStore.layerConfigs.filter((l) => l.type === 'tile').length
)
</script>

<style scoped>
.data-view {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 22px;
  margin: 0 0 20px;
  color: var(--text-primary);
}

h3 {
  font-size: 16px;
  margin: 20px 0 12px;
  color: var(--text-primary);
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-sidebar);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* 详情表格 */
.detail-table {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  padding: 8px 12px;
  align-items: center;
  font-size: 13px;
}

.table-header {
  background: var(--bg-hover);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

.table-row {
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  transition: background 0.2s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--bg-hover);
}

.col-status.active {
  color: var(--accent);
  font-weight: 500;
}

/* 分组 */
.type-group {
  margin-bottom: 12px;
}

.type-title {
  font-size: 14px;
  margin: 0 0 6px;
  color: var(--accent);
  text-transform: uppercase;
}

.type-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.type-item {
  padding: 6px 12px;
  font-size: 13px;
  color: var(--text-secondary);
  border-left: 3px solid var(--border-color);
  margin-bottom: 4px;
  transition: border-color 0.2s;
}

.type-item:hover {
  border-left-color: var(--accent);
}

@media (max-width: 768px) {
  .data-view {
    padding: 16px;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
