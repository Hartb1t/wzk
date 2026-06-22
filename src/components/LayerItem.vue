<!--
  LayerItem.vue - 图层列表项组件
  使用 Props 接收图层数据，Emit 通知父组件切换/修改透明度
  支持 v-model 显隐控制
-->
<template>
  <li class="layer-item" :class="{ visible: layer.visible }">
    <!-- 可见性开关 -->
    <label class="layer-toggle">
      <input
        type="checkbox"
        :checked="layer.visible"
        @change="$emit('toggle')"
        class="toggle-checkbox"
      />
      <span class="toggle-slider"></span>
    </label>

    <!-- 图层信息 -->
    <div class="layer-info">
      <span class="layer-name">{{ layer.name }}</span>
      <span class="layer-type-badge">{{ layer.type }}</span>
    </div>

    <!-- 透明度控制 -->
    <div class="layer-opacity" v-if="layer.visible">
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        :value="layer.opacity"
        @input="$emit('opacityChange', parseFloat($event.target.value))"
        class="opacity-slider"
        :title="`透明度: ${Math.round(layer.opacity * 100)}%`"
      />
    </div>
  </li>
</template>

<script setup>
/**
 * @props layer - 图层配置对象
 * @emits toggle - 切换可见性
 * @emits opacityChange - 修改透明度
 */
defineProps({
  /** 图层数据对象 */
  layer: {
    type: Object,
    required: true,
    validator: (v) => v.id && v.name,
  },
})

defineEmits(['toggle', 'opacityChange'])
</script>

<style scoped>
.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  transition: all 0.2s;
  flex-wrap: wrap;
}

.layer-item:hover {
  border-color: var(--accent);
  box-shadow: 0 1px 4px var(--shadow-color);
}

.layer-item:not(.visible) {
  opacity: 0.6;
}

/* 开关样式 */
.layer-toggle {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
  flex-shrink: 0;
}

.toggle-checkbox {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: var(--border-color);
  border-radius: 18px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  left: 2px;
  top: 2px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-checkbox:checked + .toggle-slider {
  background: var(--accent);
}

.toggle-checkbox:checked + .toggle-slider::before {
  transform: translateX(14px);
}

/* 图层信息 */
.layer-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.layer-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-type-badge {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--bg-hover);
  color: var(--text-muted);
  text-transform: uppercase;
  flex-shrink: 0;
}

/* 透明度滑块 */
.layer-opacity {
  width: 100%;
  padding-left: 40px;
}

.opacity-slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--border-color);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
}
</style>
