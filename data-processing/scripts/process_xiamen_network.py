"""
厦门思明区城市路网数据处理脚本
功能：
  1. 用 OSMnx 下载步行/驾车路网
  2. 计算接近中心性和介数中心性
  3. 将节点中心性传播到边
  4. 导出为 GeoJSON（供前端 MapLibre 渲染）

使用方法：
  pip install osmnx networkx geopandas
  python process_xiamen_network.py
"""

import os
import sys
import time

try:
    import osmnx as ox
    import networkx as nx
    import geopandas as gpd
except ImportError as e:
    print(f"缺少依赖: {e}")
    print("请运行: pip install osmnx networkx geopandas")
    sys.exit(1)

# ===== 配置参数 =====
# 厦门思明区中心点 (lat, lon)
CENTER = (24.479, 118.089)
# 覆盖半径（米），约 8km x 8km 核心区
DIST = 4000
# 介数中心性采样数（加速计算）
BETWEENNESS_K = 200
# 输出目录
OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "data"
)


def download_network(network_type: str):
    """下载指定类型的路网图"""
    print(f"\n>>> 正在下载 {network_type} 路网 (中心={CENTER}, 半径={DIST}m)...")
    t0 = time.time()
    G = ox.graph_from_point(CENTER, dist=DIST, network_type=network_type)
    print(f"    下载完成: {G.number_of_nodes()} 节点, {G.number_of_edges()} 条边 ({time.time()-t0:.1f}s)")
    return G


def compute_centrality(G):
    """计算接近中心性和介数中心性，写回节点属性"""
    print(">>> 正在计算中心性指标...")
    t0 = time.time()

    # 转无向图
    G_undirected = G.to_undirected()
    n_nodes = G_undirected.number_of_nodes()

    # 接近中心性
    print("    计算接近中心性 (closeness)...")
    closeness = nx.closeness_centrality(G_undirected)

    # 介数中心性（采样近似）
    k = min(BETWEENNESS_K, n_nodes)
    print(f"    计算介数中心性 (betweenness, k={k})...")
    betweenness = nx.betweenness_centrality(G_undirected, k=k, normalized=True)

    # 写回节点属性
    nx.set_node_attributes(G, closeness, "closeness")
    nx.set_node_attributes(G, betweenness, "betweenness")

    print(f"    中心性计算完成 ({time.time()-t0:.1f}s)")
    return G


def edge_centrality_from_nodes(G):
    """将节点中心性映射到边：取两端节点的平均值"""
    for u, v, k, data in G.edges(keys=True, data=True):
        data["closeness"] = (
            G.nodes[u].get("closeness", 0) + G.nodes[v].get("closeness", 0)
        ) / 2
        data["betweenness"] = (
            G.nodes[u].get("betweenness", 0) + G.nodes[v].get("betweenness", 0)
        ) / 2
    return G


def export_to_geojson(G, filepath: str):
    """导出路网为 GeoJSON，保留关键属性"""
    print(f">>> 正在导出 GeoJSON: {os.path.basename(filepath)}")

    edges_gdf = ox.graph_to_gdfs(G, nodes=False, edges=True)

    # 选择需要的列
    keep_cols = ["geometry", "name", "highway", "length", "closeness", "betweenness", "osmid"]
    available = [c for c in keep_cols if c in edges_gdf.columns]
    edges_gdf = edges_gdf[available].copy()

    # 处理 list 类型字段（MultiDiGraph 平行边）
    for col in ["highway", "name"]:
        if col in edges_gdf.columns:
            edges_gdf[col] = edges_gdf[col].apply(
                lambda x: x[0] if isinstance(x, list) else (str(x) if x else "未命名")
            )

    # osmid 转字符串（避免大整数 JSON 精度问题）
    if "osmid" in edges_gdf.columns:
        edges_gdf["osmid"] = edges_gdf["osmid"].apply(
            lambda x: str(x[0]) if isinstance(x, list) else str(x)
        )

    # 确保 length 为数值
    if "length" in edges_gdf.columns:
        edges_gdf["length"] = edges_gdf["length"].apply(
            lambda x: float(x[0]) if isinstance(x, list) else float(x)
        )

    # 确保中心性为数值
    for col in ["closeness", "betweenness"]:
        if col in edges_gdf.columns:
            edges_gdf[col] = edges_gdf[col].apply(lambda x: round(float(x), 6))

    # 确保 CRS 为 WGS84
    if edges_gdf.crs and str(edges_gdf.crs) != "EPSG:4326":
        edges_gdf = edges_gdf.to_crs(epsg=4326)

    # 重置索引，去掉 MultiIndex
    edges_gdf = edges_gdf.reset_index(drop=True)

    # 写入
    edges_gdf.to_file(filepath, driver="GeoJSON")
    print(f"    已导出: {len(edges_gdf)} 条边 -> {filepath}")
    return len(edges_gdf)


def print_summary(G, label: str):
    """输出路网统计摘要"""
    print(f"\n{'='*50}")
    print(f"  {label} 路网统计")
    print(f"{'='*50}")
    print(f"  节点数: {G.number_of_nodes()}")
    print(f"  边数:   {G.number_of_edges()}")

    closeness_vals = [d["closeness"] for _, d in G.nodes(data=True) if "closeness" in d]
    between_vals = [d["betweenness"] for _, d in G.nodes(data=True) if "betweenness" in d]

    if closeness_vals:
        print(
            f"  接近中心性: min={min(closeness_vals):.4f}, "
            f"max={max(closeness_vals):.4f}, "
            f"mean={sum(closeness_vals)/len(closeness_vals):.4f}"
        )
    if between_vals:
        print(
            f"  介数中心性: min={min(between_vals):.4f}, "
            f"max={max(between_vals):.4f}, "
            f"mean={sum(between_vals)/len(between_vals):.4f}"
        )

    # 道路等级分布
    hw_count = {}
    for _, _, _, d in G.edges(keys=True, data=True):
        hw = d.get("highway", "unknown")
        hw = hw[0] if isinstance(hw, list) else str(hw)
        hw_count[hw] = hw_count.get(hw, 0) + 1

    print("  道路等级分布:")
    for hw, cnt in sorted(hw_count.items(), key=lambda x: -x[1]):
        print(f"    {hw}: {cnt} 条")


def main():
    print("=" * 50)
    print("  厦门思明区城市路网数据处理")
    print("=" * 50)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # --- 步行路网 ---
    G_walk = download_network("walk")
    G_walk = compute_centrality(G_walk)
    G_walk = edge_centrality_from_nodes(G_walk)
    print_summary(G_walk, "步行路网 (Walk)")
    walk_path = os.path.join(OUTPUT_DIR, "xiamen-walk.geojson")
    export_to_geojson(G_walk, walk_path)

    # --- 驾车路网 ---
    G_drive = download_network("drive")
    G_drive = compute_centrality(G_drive)
    G_drive = edge_centrality_from_nodes(G_drive)
    print_summary(G_drive, "驾车路网 (Drive)")
    drive_path = os.path.join(OUTPUT_DIR, "xiamen-drive.geojson")
    export_to_geojson(G_drive, drive_path)

    print("\n" + "=" * 50)
    print("  全部处理完成！")
    print(f"  步行路网: {walk_path}")
    print(f"  驾车路网: {drive_path}")
    print("=" * 50)


if __name__ == "__main__":
    main()
