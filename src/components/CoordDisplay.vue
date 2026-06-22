<!--
  CoordDisplay.vue - 坐标显示组件
  实时显示鼠标所在位置的经纬度坐标
  使用组合式 API，从 mapStore 获取坐标数据
-->
<template>
  <div class="coord-display">
    <span v-if="hasCoord" class="coord-text">
      <span class="coord-label">经度:</span>
      <span class="coord-value">{{ formatLng }}</span>
      <span class="coord-sep">|</span>
      <span class="coord-label">纬度:</span>
      <span class="coord-value">{{ formatLat }}</span>
    </span>
    <span v-else class="coord-placeholder">将鼠标移至地图查看坐标</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMapStore } from '@/stores/mapStore.js'

const mapStore = useMapStore()

/** 是否有有效坐标 */
const hasCoord = computed(
  () => mapStore.mouseCoord.lat !== null && mapStore.mouseCoord.lng !== null
)

/** 格式化纬度 */
const formatLat = computed(() => {
  if (!hasCoord.value) return ''
  const { lat } = mapStore.mouseCoord
  const dir = lat >= 0 ? 'N' : 'S'
  return `${Math.abs(lat).toFixed(6)}°${dir}`
})

/** 格式化经度 */
const formatLng = computed(() => {
  if (!hasCoord.value) return ''
  const { lng } = mapStore.mouseCoord
  const dir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lng).toFixed(6)}°${dir}`
})
</script>

<style scoped>
.coord-display {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.coord-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.coord-label {
  color: var(--text-secondary);
}

.coord-value {
  color: var(--accent);
  font-weight: 500;
  min-width: 80px;
}

.coord-sep {
  color: var(--border-color);
  margin: 0 4px;
}

.coord-placeholder {
  color: var(--text-muted);
  font-style: italic;
}
</style>
