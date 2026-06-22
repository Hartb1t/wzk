<!--
  MapToolbar.vue - 地图工具栏组件
  提供平移、测距、标记、缩放等地图操作工具按钮
  支持 CSS3 过渡与悬停效果，与地图联动
-->
<template>
  <div class="map-toolbar">
    <div class="tool-group">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="tool-btn"
        :class="{ active: mapStore.activeTool === tool.id }"
        @click="selectTool(tool.id)"
        :title="tool.label"
      >
        <span class="tool-icon">{{ tool.icon }}</span>
        <span class="tool-label">{{ tool.label }}</span>
      </button>
    </div>
    <div class="tool-group zoom-group">
      <button class="tool-btn" @click="$emit('zoomIn')" title="放大">
        <span class="tool-icon">🔍+</span>
      </button>
      <button class="tool-btn" @click="$emit('zoomOut')" title="缩小">
        <span class="tool-icon">🔍-</span>
      </button>
      <button class="tool-btn" @click="$emit('resetView')" title="重置视图">
        <span class="tool-icon">🏠</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useMapStore } from '@/stores/mapStore.js'

const mapStore = useMapStore()

defineEmits(['zoomIn', 'zoomOut', 'resetView'])

/** 工具配置列表 */
const tools = [
  { id: 'pan', icon: '✋', label: '平移' },
  { id: 'measure', icon: '📏', label: '测距' },
  { id: 'marker', icon: '📌', label: '标记' },
  { id: 'select', icon: '🔲', label: '选择' },
]

/**
 * 选择工具并同步到 Store
 * @param {string} toolId - 工具标识
 */
const selectTool = (toolId) => {
  mapStore.setActiveTool(toolId)
}
</script>

<style scoped>
.map-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: var(--bg-sidebar);
  border-bottom: 1px solid var(--border-color);
  gap: 8px;
}

.tool-group {
  display: flex;
  gap: 4px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.tool-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: 0;
}

.tool-btn:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px var(--shadow-color);
}

.tool-btn:hover::before {
  opacity: 0.08;
}

.tool-btn.active {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 500;
}

.tool-icon {
  font-size: 15px;
  position: relative;
  z-index: 1;
}

.tool-label {
  position: relative;
  z-index: 1;
}

/* 响应式：移动端隐藏工具文字 */
@media (max-width: 768px) {
  .tool-label {
    display: none;
  }
  .tool-btn {
    padding: 5px 8px;
  }
}
</style>
