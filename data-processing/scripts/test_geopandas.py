import geopandas as gpd
import shapely  # 直接导入shapely模块获取版本
from shapely.geometry import Point, LineString, Polygon

# 1. 创建基本几何对象
point = Point(106.55, 29.56)  # 重庆坐标
line = LineString([(106.5, 29.5), (106.6, 29.6)])
polygon = Polygon([(106.5, 29.5), (106.6, 29.5), (106.6, 29.6), (106.5, 29.6)])

# 2. 创建GeoDataFrame
gdf = gpd.GeoDataFrame(
    {
        "name": ["重庆点", "重庆线", "重庆面"],
        "geometry": [point, line, polygon]
    },
    crs="EPSG:4326"  # WGS84坐标系
)

# 3. 输出结果
print("=== 空间库安装验证成功 ===")
print(f"Geopandas版本：{gpd.__version__}")
print(f"Shapely版本：{shapely.__version__}")  # 修正：直接从shapely模块获取版本
print("\n创建的空间数据：")
print(gdf)

# 4. 保存为GeoJSON文件（验证数据读写功能）
gdf.to_file("chongqing_test.geojson", driver="GeoJSON")
print("\n✅ 已保存为chongqing_test.geojson文件")
