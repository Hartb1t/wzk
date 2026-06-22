/**
 * 底图图层工厂函数模块
 * 封装高德地图多底图配置（标准街道、卫星影像、影像注记）
 * 注意：高德使用 GCJ-02 坐标系（火星坐标），与 WGS-84 有数百米偏移，属正常现象
 * @module tiandituLayers
 */

import L from 'leaflet'

/**
 * 高德地图标准街道底图
 * @returns {L.TileLayer}
 */
export const createAmapNormalLayer = () =>
  L.tileLayer(
    'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    {
      subdomains: '1234',
      attribution: '&copy; <a href="https://www.amap.com">高德地图</a>',
      maxZoom: 18,
    }
  )

/**
 * 高德地图卫星影像底图
 * @returns {L.TileLayer}
 */
export const createAmapSatelliteLayer = () =>
  L.tileLayer(
    'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    {
      subdomains: '1234',
      attribution: '&copy; <a href="https://www.amap.com">高德地图</a>',
      maxZoom: 18,
    }
  )

/**
 * 高德地图卫星注记层 - 叠加在影像底图上显示地名标注
 * @returns {L.TileLayer}
 */
export const createAmapSatelliteAnnotationLayer = () =>
  L.tileLayer(
    'https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
    {
      subdomains: '1234',
      attribution: '&copy; 高德地图',
      maxZoom: 18,
    }
  )

/**
 * 获取默认底图集合（用于 L.control.layers）
 * 返回高德标准街道、高德卫星影像+注记两种组合
 * @returns {Object} baseMaps 键值对
 */
export const getDefaultBaseMaps = () => {
  // 卫星影像 + 注记叠加
  const satGroup = L.layerGroup([createAmapSatelliteLayer(), createAmapSatelliteAnnotationLayer()])

  return {
    '高德标准': createAmapNormalLayer(),
    '高德卫星': satGroup,
  }
}
