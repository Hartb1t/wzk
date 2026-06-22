/**
 * 专题地图配色方案模块
 * 定义顺序色阶、发散色阶和双变量色阶
 * @module colorSchemes
 */

/**
 * 顺序色阶 - YlOrRd（黄→橙→红）
 * 适用于连续递增数据（如人口密度、GDP）
 * 7 级分级
 */
export const sequentialYlOrRd = [
  '#ffffcc', '#ffeda0', '#fed976', '#feb24c',
  '#fd8d3c', '#fc4e2a', '#e31a1c',
]

/**
 * 顺序色阶 - YlGnBu（黄→绿→蓝）
 * 适用于连续递增数据
 */
export const sequentialYlGnBu = [
  '#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb',
  '#41b6c4', '#1d91c0', '#225ea8',
]

/**
 * 顺序色阶 - Blues（蓝色渐变）
 * 适用于连续递增数据
 */
export const sequentialBlues = [
  '#f7fbff', '#deebf7', '#c6dbef', '#9ecae1',
  '#6baed6', '#3182bd', '#08519c',
]

/**
 * 发散色阶 - RdYlBu（红→黄→蓝）
 * 适用于正负对比数据（如增长率、偏差值）
 * 8 级分级
 */
export const divergentRdYlBu = [
  '#d73027', '#f46d43', '#fdae61', '#fee090',
  '#e0f3f8', '#abd9e9', '#74add1', '#4575b4',
]

/**
 * 发散色阶 - RdBu（红→蓝）
 * 适用于正负对比
 */
export const divergentRdBu = [
  '#b2182b', '#d6604d', '#f4a582', '#fddbc7',
  '#d1e5f0', '#92c5de', '#4393c3', '#2166ac',
]

/**
 * 双变量 3x3 色阶矩阵
 * 行 = 变量1（低→高），列 = 变量2（低→高）
 * 用于同时展示两个属性变量
 */
export const bivariate3x3 = [
  ['#e8e8e8', '#ace4e4', '#5ac8c8'],
  ['#dfb0d6', '#a5add3', '#5698b9'],
  ['#be64ac', '#8c62aa', '#3b4994'],
]

/**
 * POI 类型配色映射
 */
export const poiTypeColors = {
  '景点': '#e74c3c',
  '教育': '#3498db',
  '交通': '#f39c12',
  '商业': '#2ecc71',
  '餐饮': '#e67e22',
  '公园': '#27ae60',
}

/**
 * 分级设色函数 - 根据值和断点返回颜色
 * @param {number} value - 属性值
 * @param {number[]} breaks - 分级断点数组（升序）
 * @param {string[]} colors - 颜色数组（长度 = breaks.length + 1）
 * @returns {string} 对应颜色
 */
export const getColor = (value, breaks, colors) => {
  for (let i = 0; i < breaks.length; i++) {
    if (value <= breaks[i]) return colors[i]
  }
  return colors[colors.length - 1]
}

/**
 * 人口密度分级断点（万人/km²）
 */
export const densityBreaks = [1000, 2000, 3000, 4000, 5000, 10000, 20000]

/**
 * GDP 分级断点（亿元）
 */
export const gdpBreaks = [500, 800, 1000, 1500, 2000, 3000, 4000]

/**
 * 人口分级断点（万人）
 */
export const populationBreaks = [50, 80, 100, 150, 200, 250, 300]

/**
 * 路网道路等级配色 (OSM highway tag)
 * 从高速（红）→ 主干（橙黄）→ 支路（绿蓝）→ 步行（深蓝紫）
 */
export const highwayTypeColors = {
  motorway: '#e31a1c',
  trunk: '#fc4e2a',
  trunk_link: '#fc4e2a',
  primary: '#fd8d3c',
  primary_link: '#fd8d3c',
  secondary: '#feb24c',
  secondary_link: '#feb24c',
  tertiary: '#fed976',
  tertiary_link: '#fed976',
  residential: '#7fcdbb',
  living_street: '#41b6c4',
  pedestrian: '#1d91c0',
  footway: '#225ea8',
  cycleway: '#2ca25f',
  service: '#bdbdbd',
  unclassified: '#969696',
  path: '#6a3d9a',
  steps: '#8856a7',
  track: '#997950',
}

/**
 * 路网道路等级中文标签
 */
export const highwayTypeLabels = {
  motorway: '高速公路',
  trunk: '快速路',
  trunk_link: '快速路匝道',
  primary: '主干道',
  primary_link: '主干道匝道',
  secondary: '次干道',
  secondary_link: '次干道匝道',
  tertiary: '支路',
  tertiary_link: '支路匝道',
  residential: '居住区道路',
  living_street: '生活街道',
  pedestrian: '步行街',
  footway: '人行步道',
  cycleway: '自行车道',
  service: '服务道路',
  unclassified: '未分级道路',
  path: '小路',
  steps: '台阶',
  track: '土路',
}
