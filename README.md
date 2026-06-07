# GIS全栈项目 (GIS Fullstack Starter)

## 1. 项目简介

这是一个完整的GIS（地理信息系统）全栈项目，集成了前端可视化、后端服务和空间数据处理能力。项目采用前后端分离架构，支持空间数据的采集、处理、存储和可视化展示，适用于地图应用开发、空间分析、地理数据处理等场景。

本项目旨在为开发者提供一个开箱即用的GIS开发脚手架，帮助快速构建现代化的地理信息应用系统。

## 2. 技术栈说明

### 前端层 (Frontend)
- **Vue 3** - 渐进式JavaScript框架，用于构建用户界面
- **Leaflet** - 轻量级开源地图库，支持多种地图服务和图层
- **TypeScript** - 为JavaScript提供类型系统，增强代码可维护性
- **Vite** - 下一代前端构建工具，提供极速的开发体验

### 后端层 (Backend)
- **Java 21** - 最新的LTS版本Java开发环境
- **Spring Boot 3.3.5** - 简化Spring应用开发的框架
- **Spring Web** - 提供RESTful API支持
- **Maven** - 项目构建和依赖管理工具

### 数据处理层 (Data Processing)
- **Python 3.x** - 数据处理脚本语言
- **Fiona** - 空间数据读写库（基于GDAL）
- **PIL (Pillow)** - 图像处理库
- **GeoPandas** - 空间数据分析库（推荐）
- **Shapely** - 几何对象操作库（推荐）

### 开发工具
- **Git** - 版本控制系统
- **pnpm** - 快速、磁盘高效的包管理器
- **Node.js** - JavaScript运行时环境

## 3. 环境要求

在开始开发前，请确保系统已安装以下环境：

| 工具 | 版本要求 | 用途 |
|------|---------|------|
| Node.js | >= 16.x | 前端开发环境 |
| pnpm | >= 8.x | 前端包管理器 |
| Python | >= 3.8 | 数据处理脚本 |
| JDK | 21 | 后端开发环境 |
| Maven | >= 3.8 | 后端构建工具 |
| Git | >= 2.x | 版本控制 |

### 环境检查

项目提供了环境自检工具，运行以下命令检查环境配置：

```bash
python check_env.py
```

该工具会自动检测所有必需的环境依赖，并给出详细的配置状态报告。

## 4. 快速启动步骤

### 4.1 克隆项目

```bash
git clone <repository-url>
cd gis-fullstack-starter
```

### 4.2 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

前端服务默认运行在 `http://localhost:5173`

### 4.3 数据处理层启动

```bash
# 进入数据处理目录
cd data-processing

# 创建虚拟环境（推荐）
python -m venv .venv

# 激活虚拟环境
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 运行数据处理脚本
python main.py
```

### 4.4 后端启动

```bash
# 进入后端目录
cd backend

# 使用Maven编译项目
mvn clean compile

# 启动Spring Boot应用
mvn spring-boot:run

# 或打包后运行
mvn clean package
java -jar target/gis-backend-1.0-SNAPSHOT.jar
```

后端服务默认运行在 `http://localhost:8080`

### 4.5 完整启动流程

```bash
# 1. 检查环境
python check_env.py

# 2. 启动后端（新终端）
cd backend
mvn spring-boot:run

# 3. 启动前端（新终端）
cd frontend
pnpm install
pnpm dev

# 4. 运行数据处理（按需）
cd data-processing
python main.py
```

## 5. 详细的目录结构说明

```
gis-fullstack-starter/
├── frontend/                    # 前端项目目录
│   ├── src/                     # 源代码目录
│   │   ├── components/          # Vue组件
│   │   │   ├── Map/             # 地图相关组件
│   │   │   ├── Layer/           # 图层控制组件
│   │   │   └── Common/          # 通用UI组件
│   │   ├── views/               # 页面视图
│   │   ├── api/                 # API请求封装
│   │   ├── utils/               # 工具函数
│   │   ├── assets/              # 静态资源（图片、样式等）
│   │   ├── App.vue              # 根组件
│   │   └── main.ts              # 应用入口
│   ├── public/                  # 公共静态资源
│   ├── package.json             # 项目依赖配置
│   ├── vite.config.ts           # Vite配置文件
│   ├── tsconfig.json            # TypeScript配置
│   └── index.html               # HTML模板
│
├── backend/                     # 后端项目目录
│   ├── src/                     # 源代码目录
│   │   ├── main/                # 主代码
│   │   │   ├── java/            # Java源代码
│   │   │   │   └── com/gis/     # 包结构
│   │   │   │       ├── controller/    # 控制器层
│   │   │   │       ├── service/       # 服务层
│   │   │   │       ├── repository/    # 数据访问层
│   │   │   │       ├── entity/        # 实体类
│   │   │   │       ├── dto/           # 数据传输对象
│   │   │   │       ├── config/        # 配置类
│   │   │   │       └── util/          # 工具类
│   │   │   └── resources/       # 资源文件
│   │   │       ├── application.yml    # 应用配置
│   │   │       └── static/            # 静态资源
│   │   └── test/                # 测试代码
│   ├── pom.xml                  # Maven项目配置
│   └── target/                  # 编译输出目录
│
├── data-processing/             # 数据处理项目目录
│   ├── scripts/                 # 处理脚本
│   │   ├── data_cleaning.py     # 数据清洗
│   │   ├── coordinate_transform.py  # 坐标转换
│   │   ├── format_conversion.py # 格式转换
│   │   └── spatial_analysis.py  # 空间分析
│   ├── data/                    # 数据文件
│   │   ├── raw/                 # 原始数据
│   │   ├── processed/           # 处理后数据
│   │   └── output/              # 输出结果
│   ├── config/                  # 配置文件
│   │   └── settings.py          # 处理配置
│   ├── requirements.txt         # Python依赖
│   ├── main.py                  # 主入口脚本
│   └── .venv/                   # 虚拟环境（不提交到Git）
│
├── .gitignore                   # Git忽略文件配置
├── README.md                    # 项目说明文档
└── check_env.py                 # 环境检查工具
```

## 6. 各层职责分工

### 6.1 前端层 (Frontend)

**主要职责：**
- 提供用户交互界面和地图可视化
- 实现地图操作（缩放、平移、图层切换）
- 展示空间数据和地理信息
- 与后端API进行数据交互
- 处理用户输入和前端业务逻辑

**核心功能：**
- 📍 地图展示与交互（基于Leaflet）
- 🗺️ 多图层管理与控制
- 📊 空间数据可视化（点、线、面）
- 🔍 地理要素查询与定位
- 📱 响应式设计，支持多设备访问

### 6.2 后端层 (Backend)

**主要职责：**
- 提供RESTful API接口
- 处理业务逻辑和数据验证
- 管理数据库连接和数据持久化
- 实现空间数据查询和分析服务
- 提供系统安全和权限控制

**核心功能：**
- 🔌 RESTful API服务
- 💾 数据库CRUD操作
- 📐 空间查询与分析
- 🔐 身份认证与授权
- 📈 业务逻辑处理

### 6.3 数据处理层 (Data Processing)

**主要职责：**
- 空间数据的预处理和清洗
- 坐标系统转换
- 数据格式转换（GeoJSON、Shapefile等）
- 批量数据处理和导入
- 空间分析和计算

**核心功能：**
- 🔄 数据格式转换
- 🌐 坐标系统转换（WGS84、GCJ02等）
- 🧹 数据清洗与验证
- 📦 批量数据处理
- 📏 空间统计分析

### 6.4 层间协作关系

```
┌─────────────┐
│   用户界面   │
└──────┬──────┘
       │
       ↓
┌─────────────┐      ┌──────────────┐
│  前端层     │ ←──→ │   后端层     │
│ (Frontend)  │      │  (Backend)   │
└─────────────┘      └──────┬───────┘
                            │
                            ↓
                    ┌──────────────┐
                    │ 数据处理层   │
                    │(Data Process)│
                    └──────────────┘
```

## 7. 贡献指南

我们欢迎所有形式的贡献！无论是报告Bug、提出新功能建议、改进文档还是提交代码。

### 7.1 报告问题

如果您发现了Bug或有功能建议，请：
1. 在Issues中搜索是否已有相关问题
2. 如果没有，创建新的Issue，详细描述：
   - 问题的详细描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息（操作系统、版本等）

### 7.2 开发流程

1. **Fork项目**
   ```bash
   # 在GitHub上Fork项目到您的账号
   git clone https://github.com/YOUR_USERNAME/gis-fullstack-starter.git
   cd gis-fullstack-starter
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **进行开发**
   - 遵循代码规范
   - 编写清晰的注释
   - 添加必要的测试

4. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   # 或
   git commit -m "fix: 修复问题描述"
   ```

   提交信息格式：
   - `feat:` 新功能
   - `fix:` Bug修复
   - `docs:` 文档更新
   - `style:` 代码格式调整
   - `refactor:` 代码重构
   - `test:` 测试相关
   - `chore:` 构建/工具相关

5. **推送到远程**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建Pull Request**
   - 在GitHub上创建Pull Request
   - 填写PR描述，说明改动内容
   - 等待代码审查

### 7.3 代码规范

#### 前端代码规范
- 使用TypeScript类型注解
- 遵循Vue 3 Composition API风格
- 组件命名使用PascalCase
- 文件命名使用kebab-case
- 保持组件单一职责原则

#### 后端代码规范
- 遵循Java命名规范
- 使用Spring注解配置
- RESTful API命名规范
- 添加必要的JavaDoc注释
- 异常处理要完善

#### Python代码规范
- 遵循PEP 8编码规范
- 使用类型提示（Type Hints）
- 函数和类添加文档字符串
- 保持代码简洁易读

### 7.4 测试要求

- 新功能需要添加相应测试
- 确保所有测试通过
- 保持代码覆盖率

### 7.5 文档贡献

- 文档使用Markdown格式
- 保持文档简洁清晰
- 及时更新README和相关文档

## 8. 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 9. 联系方式

如有问题或建议，欢迎通过以下方式联系：
- 提交Issue
- 发送Pull Request
- 邮件联系：[项目维护者邮箱]

---

**Happy Coding! 🎉**
