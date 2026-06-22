<!--
  App.vue - 应用根组件
  使用 GisLayout 包裹路由视图，提供统一的 GIS 应用布局
-->
<template>
  <GisLayout>
    <router-view />
  </GisLayout>
</template>

<script setup>
import GisLayout from '@/components/GisLayout.vue'
</script>
