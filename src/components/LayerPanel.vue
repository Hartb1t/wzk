<!--
  LayerPanel.vue - 图层面板组件
  提供图层列表展示、搜索过滤、显隐控制功能
  使用 useLayers Composable 复用图层管理逻辑
  通过 computed 统计可见图层数
-->
<template>
  <div class="layer-panel">
    <!-- 面板标题 -->
    <div class="panel-header">
      <h3 class="panel-title">📋 图层管理</h3>
      <span class="layer-badge">{{ visibleCount }}/{{ totalCount }}</span>
    </div>

    <!-- 搜索过滤 -->
    <div class="panel-search">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="🔍 搜索图层..."
      />
      <button
        v-if="searchQuery"
        class="search-clear"
        @click="searchQuery = ''"
        title="清除"
      >
        ✕
      </button>
    </div>

    <!-- 批量操作 -->
    <div class="panel-actions">
      <button class="action-btn" @click="setAllVisible(true)">全部显示</button>
      <button class="action-btn" @click="setAllVisible(false)">全部隐藏</button>
    </div>

    <!-- 图层列表 (v-for 渲染) -->
    <ul class="layer-list">
      <LayerItem
        v-for="layer in filteredLayers"
        :key="layer.id"
        :layer="layer"
        @toggle="toggleLayer(layer.id)"
        @opacity-change="(val) => setOpacity(layer.id, val)"
      />
    </ul>

    <!-- 空状态 -->
    <div v-if="filteredLayers.length === 0" class="empty-state">
      <span>未找到匹配的图层</span>
    </div>
  </div>
</template>

<script setup>
import { useLayers } from '@/composables/useLayers.js'
import LayerItem from './LayerItem.vue'

// 使用 Composable 复用图层管理逻辑
const {
  searchQuery,
  filteredLayers,
  visibleCount,
  totalCount,
  toggleLayer,
  setOpacity,
  setAllVisible,
} = useLayers()
</script>

<style scoped>
.layer-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  gap: 8px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.layer-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 500;
}

/* 搜索框 */
.panel-search {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 6px 28px 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: var(--accent);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-clear {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
}

/* 批量操作 */
.panel-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* 图层列表 */
.layer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  flex: 1;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--text-muted);
  font-size: 13px;
  font-style: italic;
}
</style>
