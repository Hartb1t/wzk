/**
 * GeoJSON 数据处理模块
 * 提供 GeoJSON 解析、过滤、统计等功能
 * @module geoJsonProcessor
 */

import { haversineDistance, calcPolygonArea } from './geoUtils.js'

/**
 * 异步加载 GeoJSON 文件
 * @param {string} url - GeoJSON 文件路径
 * @returns {Promise<Object>} GeoJSON FeatureCollection
 */
export const loadGeoJSON = async (url) => {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    const data = await response.json()
    if (data.type !== 'FeatureCollection' && data.type !== 'Feature') {
      console.warn('非标准 GeoJSON 格式')
    }
    return data
  } catch (error) {
    console.error('加载 GeoJSON 失败:', error.message)
    throw error
  }
}

/**
 * 解析 GeoJSON 并提取要素信息
 * @param {Object} geojson - GeoJSON 对象
 * @returns {Array<{id, type, properties, geometry}>} 要素数组
 */
export const parseFeatures = (geojson) => {
  if (!geojson) return []
  const features = geojson.type === 'FeatureCollection' ? geojson.features : [geojson]
  return features.map((f, i) => ({
    id: f.id ?? i,
    type: f.geometry?.type ?? 'Unknown',
    properties: f.properties ?? {},
    geometry: f.geometry,
  }))
}

/**
 * 按几何类型过滤要素
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @param {string} geometryType - 几何类型（Point/LineString/Polygon 等）
 * @returns {Object} 过滤后的 FeatureCollection
 */
export const filterByType = (geojson, geometryType) => {
  if (!geojson?.features) return { type: 'FeatureCollection', features: [] }
  return {
    ...geojson,
    features: geojson.features.filter((f) => f.geometry?.type === geometryType),
  }
}

/**
 * 按属性值过滤要素
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @param {string} key - 属性名
 * @param {*} value - 属性值
 * @returns {Object} 过滤后的 FeatureCollection
 */
export const filterByProperty = (geojson, key, value) => {
  if (!geojson?.features) return { type: 'FeatureCollection', features: [] }
  return {
    ...geojson,
    features: geojson.features.filter((f) => f.properties?.[key] === value),
  }
}

/**
 * 统计 GeoJSON 中各几何类型的要素数量
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @returns {Object} 统计结果 { Point: n, LineString: n, Polygon: n, ... }
 */
export const statsByType = (geojson) => {
  if (!geojson?.features) return {}
  return geojson.features.reduce((acc, f) => {
    const type = f.geometry?.type ?? 'Unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})
}

/**
 * 计算所有 Point 要素的总距离（按顺序）
 * @param {Object} geojson - GeoJSON FeatureCollection（仅含 Point）
 * @returns {number} 总距离（米）
 */
export const calcTotalDistance = (geojson) => {
  const points = (geojson?.features || [])
    .filter((f) => f.geometry?.type === 'Point')
    .map((f) => f.geometry.coordinates)

  if (points.length < 2) return 0
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const [lng1, lat1] = points[i - 1]
    const [lng2, lat2] = points[i]
    total += haversineDistance(lat1, lng1, lat2, lng2)
  }
  return total
}

/**
 * 计算所有 Polygon 要素的总面积
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @returns {number} 总面积（平方米近似值）
 */
export const calcTotalArea = (geojson) => {
  const polygons = (geojson?.features || [])
    .filter((f) => f.geometry?.type === 'Polygon')
    .map((f) => f.geometry.coordinates[0]) // 取外环

  return polygons.reduce((sum, ring) => sum + calcPolygonArea(ring), 0)
}

/**
 * 获取要素集合的属性统计摘要
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @param {string} propKey - 数值属性名
 * @returns {{count: number, sum: number, avg: number, min: number, max: number}}
 */
export const statsSummary = (geojson, propKey) => {
  const values = (geojson?.features || [])
    .map((f) => f.properties?.[propKey])
    .filter((v) => typeof v === 'number')

  if (values.length === 0) return { count: 0, sum: 0, avg: 0, min: 0, max: 0 }
  const sum = values.reduce((a, b) => a + b, 0)
  return {
    count: values.length,
    sum,
    avg: sum / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
  }
}
