<!--
  GisLayout.vue - GIS 应用主布局组件
  使用语义化标签 + Flex/Grid 实现：顶栏 / 侧边栏 / 地图区 / 状态栏
  支持响应式适配与主题切换
-->
<template>
  <div class="gis-app" :class="{ 'sidebar-open': sidebarOpen }">
    <!-- 顶部导航栏 -->
    <header class="gis-header">
      <div class="header-left">
        <button class="menu-btn" @click="sidebarOpen = !sidebarOpen" title="切换侧边栏">
          <span class="menu-icon">☰</span>
        </button>
        <h1 class="app-title">🌍 WebGIS 二维开发实验</h1>
      </div>
      <nav class="header-nav">
        <router-link
          v-for="route in navRoutes"
          :key="route.path"
          :to="route.path"
          class="nav-link"
          active-class="nav-active"
        >
          <span class="nav-icon">{{ route.icon }}</span>
          <span class="nav-text">{{ route.title }}</span>
        </router-link>
      </nav>
      <div class="header-right">
        <button class="theme-btn" @click="toggleTheme" :title="themeLabel">
          {{ themeIcon }}
        </button>
      </div>
    </header>

    <!-- 主体区域：侧边栏 + 内容区 -->
    <div class="gis-body">
      <!-- 左侧边栏（图层面板） -->
      <aside class="gis-sidebar" v-show="sidebarOpen">
        <LayerPanel />
      </aside>

      <!-- 主内容区 -->
      <main class="gis-main">
        <!-- 地图工具栏 -->
        <MapToolbar />
        <!-- 路由页面内容 -->
        <div class="gis-content">
          <slot />
        </div>
      </main>
    </div>

    <!-- 底部状态栏 -->
    <footer class="gis-footer">
      <CoordDisplay />
      <div class="footer-info">
        <span class="layer-count">图层: {{ visibleCount }}/{{ totalCount }}</span>
        <span class="zoom-level">缩放: {{ mapStore.zoom }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMapStore } from '@/stores/mapStore.js'
import { useTheme } from '@/composables/useTheme.js'
import { useLayers } from '@/composables/useLayers.js'
import MapToolbar from './MapToolbar.vue'
import CoordDisplay from './CoordDisplay.vue'
import LayerPanel from './LayerPanel.vue'

const mapStore = useMapStore()
const { toggleTheme, themeLabel, themeIcon } = useTheme()
const { visibleCount, totalCount } = useLayers()

/** 侧边栏是否展开 */
const sidebarOpen = ref(true)

/** 导航路由配置 */
const navRoutes = [
  { path: '/', title: '地图', icon: '🗺️' },
  { path: '/data', title: '数据', icon: '📊' },
  { path: '/about', title: '关于', icon: 'ℹ️' },
]
</script>

<style scoped>
/* GIS 应用整体布局 - CSS Grid */
.gis-app {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background 0.3s, color 0.3s;
}

/* 顶部导航栏 - Flex 布局 */
.gis-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 3px var(--shadow-color);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}
.menu-btn:hover {
  background: var(--bg-hover);
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

/* 导航链接 */
.header-nav {
  display: flex;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.2s;
}
.nav-link:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.nav-active {
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 500;
}
.nav-icon {
  font-size: 16px;
}

.theme-btn {
  background: none;
  border: 1px solid var(--border-color);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: all 0.2s;
}
.theme-btn:hover {
  background: var(--bg-hover);
  transform: rotate(15deg);
}

/* 主体区域 - Flex */
.gis-body {
  display: flex;
  overflow: hidden;
}

/* 侧边栏 */
.gis-sidebar {
  width: 280px;
  min-width: 280px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  transition: width 0.3s ease, min-width 0.3s ease;
}

/* 主内容区 */
.gis-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.gis-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

/* 底部状态栏 */
.gis-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 28px;
  background: var(--bg-header);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
}

.footer-info {
  display: flex;
  gap: 16px;
}

/* 响应式 - 移动端适配 */
@media (max-width: 768px) {
  .gis-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 50;
    box-shadow: 2px 0 8px var(--shadow-color);
  }
  .gis-app:not(.sidebar-open) .gis-sidebar {
    display: none;
  }
  .app-title {
    font-size: 14px;
  }
  .nav-text {
    display: none;
  }
  .header-nav {
    gap: 2px;
  }
}
</style>
