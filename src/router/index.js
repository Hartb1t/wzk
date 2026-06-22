/**
 * Vue Router 路由配置
 * 配置多页面路由：首页/地图/数据/关于 + 实验模块
 * 使用 Hash 模式便于 GitHub Pages 部署
 */
import { createRouter, createWebHashHistory } from 'vue-router'

/** 路由配置表 */
const routes = [
  {
    path: '/',
    name: 'Map',
    component: () => import('@/views/MapView.vue'),
    meta: { title: '地图', icon: '🗺️' },
  },
  {
    path: '/data',
    name: 'Data',
    component: () => import('@/views/DataView.vue'),
    meta: { title: '数据', icon: '📊' },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于', icon: 'ℹ️' },
  },
  {
    path: '/part1',
    name: 'Part1',
    component: () => import('@/views/Part1Leaflet.vue'),
    meta: { title: 'Leaflet地图', icon: '🗺️' },
  },
  {
    path: '/part2',
    name: 'Part2',
    component: () => import('@/views/Part2Choropleth.vue'),
    meta: { title: '专题地图', icon: '📊' },
  },
  {
    path: '/part3',
    name: 'Part3',
    component: () => import('@/views/Part3MapLibre.vue'),
    meta: { title: 'MapLibre', icon: '🌐' },
  },
  {
    path: '/part4',
    name: 'Part4',
    component: () => import('@/views/Part4Portfolio.vue'),
    meta: { title: '作品集', icon: '📁' },
  },
  {
    path: '/part5',
    name: 'Part5',
    component: () => import('@/views/Part5Walkability.vue'),
    meta: { title: '路网分析', icon: '🚶' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

/**
 * 全局前置守卫 - 更新页面标题
 */
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'GIS'} - 智慧城市 GIS 平台`
  next()
})

export default router
