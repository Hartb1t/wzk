/**
 * 图层数据模型（ES6 Class 封装）
 * 用于管理地图图层的属性与状态
 * @module LayerModel
 */

import { loadGeoJSON, parseFeatures, statsByType } from './geoJsonProcessor.js'

/**
 * @class LayerModel
 * @classdesc 图层数据模型，封装图层的基本属性、可见性、数据加载等逻辑
 */
export class LayerModel {
  /**
   * 创建图层实例
   * @param {Object} options - 图层配置
   * @param {string} options.id - 图层唯一标识
   * @param {string} options.name - 图层名称
   * @param {string} [options.type='geojson'] - 图层类型（geojson/tile/wms）
   * @param {string} [options.url=''] - 数据源地址
   * @param {boolean} [options.visible=true] - 是否可见
   * @param {number} [options.opacity=1] - 透明度 (0-1)
   * @param {Object} [options.style={}] - 渲染样式配置
   */
  constructor({ id, name, type = 'geojson', url = '', visible = true, opacity = 1, style = {} }) {
    this.id = id
    this.name = name
    this.type = type
    this.url = url
    this.visible = visible
    this.opacity = opacity
    this.style = style
    /** @type {Object|null} GeoJSON 原始数据 */
    this.data = null
    /** @type {Array} 解析后的要素数组 */
    this.features = []
    /** @type {boolean} 数据是否加载完成 */
    this.loaded = false
    /** @type {string|null} 加载错误信息 */
    this.error = null
  }

  /**
   * 异步加载图层数据
   * @returns {Promise<LayerModel>} 当前图层实例
   */
  async load() {
    if (this.loaded || !this.url) return this
    try {
      this.data = await loadGeoJSON(this.url)
      this.features = parseFeatures(this.data)
      this.loaded = true
      this.error = null
    } catch (err) {
      this.error = err.message
      this.loaded = false
    }
    return this
  }

  /**
   * 获取图层统计信息
   * @returns {Object} 各几何类型的要素数量统计
   */
  getStats() {
    return statsByType(this.data)
  }

  /**
   * 切换图层可见性
   * @returns {boolean} 新的可见状态
   */
  toggle() {
    this.visible = !this.visible
    return this.visible
  }

  /**
   * 设置透明度
   * @param {number} value - 透明度 (0-1)
   */
  setOpacity(value) {
    this.opacity = Math.max(0, Math.min(1, value))
  }

  /**
   * 将图层数据序列化为普通对象
   * @returns {Object} 图层普通对象
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      url: this.url,
      visible: this.visible,
      opacity: this.opacity,
      style: this.style,
      loaded: this.loaded,
      featureCount: this.features.length,
      error: this.error,
    }
  }
}
