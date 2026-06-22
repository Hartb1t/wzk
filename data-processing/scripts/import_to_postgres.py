"""
路网数据导入 PostgreSQL 脚本
将 OSMnx 导出的 GeoJSON 路网数据批量导入数据库，供 Spring Boot 后端查询

前置条件:
  1. PostgreSQL 已安装并运行
  2. 已创建数据库 gisdb:  CREATE DATABASE gisdb;
  3. (可选) 启用 PostGIS: CREATE EXTENSION postgis;
  4. pip install psycopg2-binary

使用方法:
  python import_to_postgres.py
"""

import json
import os
import sys
import time

try:
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    print("缺少依赖: psycopg2")
    print("请运行: pip install psycopg2-binary")
    sys.exit(1)

# ===== 数据库配置 =====
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "gisdb",
    "user": "postgres",
    "password": "postgres",  # 按实际情况修改
}

# GeoJSON 文件路径
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "data")

# 建表 SQL
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS road_segments (
    id            BIGSERIAL PRIMARY KEY,
    osmid         VARCHAR(64),
    name          VARCHAR(255),
    highway       VARCHAR(64),
    length        DOUBLE PRECISION,
    closeness     DOUBLE PRECISION,
    betweenness   DOUBLE PRECISION,
    network_type  VARCHAR(16) NOT NULL,
    geometry      TEXT
);

CREATE INDEX IF NOT EXISTS idx_network_type ON road_segments (network_type);
CREATE INDEX IF NOT EXISTS idx_highway ON road_segments (highway);
CREATE INDEX IF NOT EXISTS idx_osmid ON road_segments (osmid);
"""


def load_geojson(filepath: str) -> dict:
    """加载 GeoJSON 文件"""
    print(f"  读取: {os.path.basename(filepath)}")
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_features(geojson: dict, network_type: str) -> list:
    """从 GeoJSON 提取路段数据为元组列表"""
    features = []
    for feat in geojson.get("features", []):
        props = feat.get("properties", {})
        geom = json.dumps(feat.get("geometry", {}), ensure_ascii=False)
        features.append((
            str(props.get("osmid", "")),
            props.get("name", "未命名"),
            props.get("highway", "unclassified"),
            float(props.get("length", 0)),
            float(props.get("closeness", 0)),
            float(props.get("betweenness", 0)),
            network_type,
            geom,
        ))
    return features


def import_data():
    """主导入流程"""
    print("=" * 50)
    print("  路网数据导入 PostgreSQL")
    print("=" * 50)

    # 连接数据库
    print(f"\n>>> 连接数据库 {DB_CONFIG['dbname']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}...")
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = True
    cur = conn.cursor()

    # 建表
    print(">>> 创建表 road_segments...")
    cur.execute(CREATE_TABLE_SQL)
    print("    表已就绪")

    # 导入文件列表
    files = [
        ("xiamen-walk.geojson", "walk"),
        ("xiamen-drive.geojson", "drive"),
    ]

    insert_sql = """
        INSERT INTO road_segments (osmid, name, highway, length, closeness, betweenness, network_type, geometry)
        VALUES %s
    """

    for filename, network_type in files:
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f"\n!!! 文件不存在: {filepath}，跳过")
            continue

        geojson = load_geojson(filepath)
        features = extract_features(geojson, network_type)
        print(f"    解析完成: {len(features)} 条路段 (类型={network_type})")

        # 清空同类型旧数据
        cur.execute("DELETE FROM road_segments WHERE network_type = %s", (network_type,))
        print(f"    已清除旧 {network_type} 数据")

        # 批量插入
        t0 = time.time()
        execute_values(cur, insert_sql, features, page_size=500)
        print(f"    插入完成: {len(features)} 条 ({time.time()-t0:.1f}s)")

    # 统计
    cur.execute("SELECT network_type, COUNT(*) FROM road_segments GROUP BY network_type ORDER BY network_type")
    rows = cur.fetchall()
    print(f"\n{'='*50}")
    print("  导入完成！数据库统计:")
    for net_type, count in rows:
        print(f"    {net_type}: {count:,} 条路段")
    print(f"{'='*50}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    import_data()
