/**
 * 应用入口文件
 * 创建 Vue 应用实例，挂载 Pinia、Vue Router，渲染根组件
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './style.css'

// 创建 Vue 应用
const app = createApp(App)

// 注册 Pinia 状态管理
const pinia = createPinia()
app.use(pinia)

// 注册路由
app.use(router)

// 挂载到 DOM
app.mount('#app')
