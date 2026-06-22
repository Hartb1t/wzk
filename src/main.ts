/**
 * Vue 应用入口
 * 挂载 Vue 3 + Pinia + Vue Router，初始化 GIS 平台
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import './style.css'
import 'leaflet/dist/leaflet.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
