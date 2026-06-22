# WebGIS 城市路网结构与可步行性可视化

> 智慧城市学院《GIS工程与开发》课程实验项目
> 基于 Vue3 + MapLibre GL JS + Spring Boot 的全栈 WebGIS 平台

## 项目功能

| 模块 | 说明 |
|------|------|
| Leaflet 地图交互 (Part1) | 高德地图底图、图层管理、POI 标注 |
| GeoJSON 专题地图 (Part2) | 分级设色、双变量地图、区县数据可视化 |
| MapLibre 矢量瓦片 (Part3) | 数据驱动样式、点聚合、3D 建筑 |
| 综合作品集 (Part4) | 项目展示与功能汇总 |
| **城市路网分析 (Part5)** | **厦门思明区路网可视化、中心性着色、路段交互** |
| Spring Boot 后端 | 路网查询 REST API、PostgreSQL 数据存储 |

## 环境要求

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 前端运行环境 |
| pnpm | 8+ | 前端包管理（也可用 npm） |
| Python | 3.10+ | 数据处理脚本 |
| Java | 21 | 后端 Spring Boot |
| PostgreSQL | 14+ | 后端数据库（可选） |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Hartb1t/wzk.git
cd wzk
```

### 2. 启动前端

```bash
pnpm install
pnpm dev
```

浏览器自动打开 `http://localhost:3000`，访问 `/#/part5` 查看路网分析页面。

> 如果未安装 pnpm：`npm install -g pnpm`

### 3. 各页面路由

| 路由 | 页面 |
|------|------|
| `/#/` | 主地图 |
| `/#/part1` | Leaflet 地图 |
| `/#/part2` | 专题地图 |
| `/#/part3` | MapLibre 可视化 |
| `/#/part4` | 作品集 |
| `/#/part5` | 路网分析 |
| `/#/data` | 数据管理 |
| `/#/about` | 关于 |

## 数据处理（Python 脚本）

### 安装 Python 依赖

```bash
pip install -r data-processing/requirements.txt
```

### 下载路网数据

从 OpenStreetMap 下载厦门思明区的步行和驾车路网，计算中心性指标并导出 GeoJSON：

```bash
python data-processing/scripts/process_xiamen_network.py
```

输出文件：
- `public/data/xiamen-walk.geojson` — 步行路网（~10000 条边）
- `public/data/xiamen-drive.geojson` — 驾车路网（~4400 条边）

### 导入 PostgreSQL（后端选做）

```bash
# 1. 确保 PostgreSQL 已启动，创建数据库
#    CREATE DATABASE gisdb;

# 2. 导入数据
python data-processing/scripts/import_to_postgres.py
```

> 导入前请检查 `import_to_postgres.py` 中的数据库连接配置（默认 localhost:5432, 用户名 postgres）

## 启动后端（Spring Boot，选做加分项）

### 前置条件

- Java 21 已安装
- PostgreSQL 已启动并创建了 `gisdb` 数据库
- 路网数据已导入（执行上方导入脚本）

### 运行

```bash
cd backend
mvnw.cmd spring-boot:run        # Windows
# ./mvnw spring-boot:run        # Linux/Mac
```

后端启动在 `http://localhost:8080`

### API 接口

| 接口 | 说明 | 示例 |
|------|------|------|
| `GET /api/roads` | 获取路网 GeoJSON | `/api/roads?type=walk` |
| `GET /api/roads/{id}` | 单条路段详情 | `/api/roads/42` |
| `GET /api/roads/stats` | 路网统计 | `/api/roads/stats?type=walk` |
| `GET /api/roads/top` | 介数中心性 Top N | `/api/roads/top?type=walk&n=50` |
| `GET /api/roads/filter` | 中心性范围筛选 | `/api/roads/filter?type=walk&min=0.03&max=0.05` |
| `GET /api/roads/highway` | 按道路等级筛选 | `/api/roads/highway?type=walk&highway=primary` |

## 路网分析功能说明（Part5）

### 着色模式

| 模式 | 说明 | 色阶 |
|------|------|------|
| 道路等级 | 按 OSM highway 标签分类着色 | 红(高速) → 橙(主干) → 绿蓝(支路) → 蓝紫(步行) |
| 接近中心性 | Closeness Centrality，反映节点到达其他节点的便捷程度 | Blues 色阶（浅蓝→深蓝） |
| 介数中心性 | Betweenness Centrality，反映路段作为最短路径中转的重要性 | YlOrRd 色阶（黄→红） |

### 交互功能

- **路网切换**：步行路网 / 驾车路网
- **路段点选**：点击路段弹出 Popup，显示道路名称、等级、长度、中心性指标
- **局部放大**：点击路段后自动 flyTo 放大
- **悬停高亮**：鼠标悬停路段白色高亮
- **底图切换**：简洁 / 暗色 / 标准 三种底图样式

## 项目结构

```
├── src/                          # 前端源码 (Vue3)
│   ├── views/                    # 页面组件
│   │   ├── Part5Walkability.vue  # 路网分析页面
│   │   └── ...
│   ├── components/               # 公共组件
│   ├── utils/                    # 工具函数 + 配色方案
│   ├── stores/                   # Pinia 状态管理
│   ├── composables/              # 组合式函数
│   └── router/                   # Vue Router 路由
├── public/data/                  # 静态数据 (GeoJSON)
├── backend/                      # 后端 (Spring Boot)
│   └── src/main/java/com/gis/backend/
├── data-processing/              # Python 数据处理
│   ├── scripts/                  # 脚本
│   └── requirements.txt          # Python 依赖
├── package.json                  # 前端依赖
└── vite.config.js                # Vite 构建配置
```

## 技术栈

- **前端**: Vue 3, Vite, MapLibre GL JS, Pinia, Vue Router
- **后端**: Spring Boot 3.3, Spring Data JPA, PostgreSQL
- **数据**: OSMnx, NetworkX, GeoPandas
- **数据源**: OpenStreetMap (OSM)

## Python 依赖清单

```
geopandas==1.1.3        # 地理数据处理
shapely==2.0.7          # 几何对象
fiona==1.10.1           # 矢量文件读写
pyproj==3.6.1           # 坐标投影
matplotlib==3.9.2       # 绑图（可选）
osmnx>=2.0.0            # OSM 路网下载
networkx>=3.0           # 图计算/中心性
psycopg2-binary>=2.9.9  # PostgreSQL 数据库连接
```

安装命令：`pip install -r data-processing/requirements.txt`
# wzk