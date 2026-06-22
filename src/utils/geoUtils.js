/**
 * GIS 空间数据工具函数模块
 * 提供距离计算、坐标格式化、面积统计等核心功能
 * @module geoUtils
 */

/**
 * 将角度转换为弧度
 * @param {number} deg - 角度值
 * @returns {number} 弧度值
 */
const toRad = (deg) => (deg * Math.PI) / 180

/**
 * Haversine 公式计算两点间球面距离（单位：米）
 * @param {number} lat1 - 起点纬度
 * @param {number} lng1 - 起点经度
 * @param {number} lat2 - 终点纬度
 * @param {number} lng2 - 终点经度
 * @returns {number} 两点间距离（米）
 */
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000 // 地球平均半径（米）
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 格式化坐标为可读字符串（度分秒格式）
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @param {number} [decimals=4] - 小数位数
 * @returns {string} 格式化后的坐标字符串
 */
export const formatCoord = (lat, lng, decimals = 4) => {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(decimals)}°${latDir}, ${Math.abs(lng).toFixed(decimals)}°${lngDir}`
}

/**
 * 将十进制度坐标转换为度分秒（DMS）格式
 * @param {number} dd - 十进制度
 * @param {boolean} isLat - 是否为纬度
 * @returns {string} DMS 格式字符串
 */
export const toDMS = (dd, isLat = true) => {
  const dir = isLat ? (dd >= 0 ? 'N' : 'S') : (dd >= 0 ? 'E' : 'W')
  const abs = Math.abs(dd)
  const d = Math.floor(abs)
  const minFloat = (abs - d) * 60
  const m = Math.floor(minFloat)
  const s = ((minFloat - m) * 60).toFixed(2)
  return `${d}°${m}'${s}"${dir}`
}

/**
 * 计算多边形面积（Shoelace 公式，适用于平面坐标，单位：平方米近似值）
 * @param {number[][]} coords - 坐标数组 [[lng, lat], ...]
 * @returns {number} 面积（平方米近似值）
 */
export const calcPolygonArea = (coords) => {
  if (!coords || coords.length < 3) return 0
  let area = 0
  const n = coords.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const [xi, yi] = coords[i]
    const [xj, yj] = coords[j]
    area += xi * yj - xj * yi
  }
  // 将度²转为近似平方米（在重庆纬度附近 1度 ≈ 111km）
  const DEG_TO_M = 111000
  return (Math.abs(area) / 2) * DEG_TO_M * DEG_TO_M
}

/**
 * 计算坐标数组的边界框（Bounding Box）
 * @param {number[][]} coords - 坐标数组 [[lng, lat], ...]
 * @returns {{minLng: number, maxLng: number, minLat: number, maxLat: number}}
 */
export const getBoundingBox = (coords) => {
  if (!coords || coords.length === 0) return null
  return coords.reduce(
    (acc, [lng, lat]) => ({
      minLng: Math.min(acc.minLng, lng),
      maxLng: Math.max(acc.maxLng, lng),
      minLat: Math.min(acc.minLat, lat),
      maxLat: Math.max(acc.maxLat, lat),
    }),
    { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
  )
}

/**
 * 计算一组点的中心点
 * @param {number[][]} coords - 坐标数组 [[lng, lat], ...]
 * @returns {number[]} 中心点坐标 [lng, lat]
 */
export const getCenter = (coords) => {
  if (!coords || coords.length === 0) return [0, 0]
  const sum = coords.reduce(
    (acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat],
    [0, 0]
  )
  return [sum[0] / coords.length, sum[1] / coords.length]
}
