# Screep Export

一个用于导出 Screep 游戏数据为 Prometheus 格式的 Node.js 应用程序。

## 项目北京

- [Screep 私服指标看板搭建&实施](https://blog.txuw.top/archives/screep-zhi-biao-kan-ban-shi-jian)

## 项目简介

Screep Export 是一个专业的数据导出服务，从 MongoDB 数据库中提取 Screep 游戏数据，并将其转换为 Prometheus 监控系统可识别的指标格式。该系统支持用户级别和房间级别的多维度数据监控，为游戏运营提供全面的数据洞察。

## 功能特性

- 🎮 **全面的数据采集**: 支持用户信息和房间对象的完整数据收集
- 📊 **丰富的监控指标**: 提供 CPU 使用率、GCL 等级、资源存储、建筑成本等多维度指标
- 🏷️ **灵活的标签系统**: 支持按用户名、房间、类型等维度进行数据分类
- 💰 **成本计算**: 自动计算 Creep 和建筑的建造成本
- 🔧 **实时数据更新**: 每次请求都获取最新的游戏数据
- 🚀 **高性能架构**: 基于 Express.js 和 MongoDB 连接池的高性能架构
- 📈 **Prometheus 兼容**: 完全兼容 Prometheus 监控系统
- 🏥 **健康检查**: 内置健康检查端点，支持 Kubernetes 部署

## 技术栈

- **后端框架**: Express.js 5.x
- **数据库**: MongoDB
- **语言**: TypeScript
- **监控**: Prometheus + prom-client
- **运行时**: Node.js
- **开发工具**: tsx (开发), ts-node (构建)

## 项目结构

```
screep_export/
├── src/
│   ├── config/                 # 配置文件
│   │   ├── app.config.ts      # 应用配置
│   │   └── database.config.ts # 数据库配置
│   ├── database/              # 数据库服务
│   │   └── mongodb.service.ts # MongoDB 连接管理
│   ├── middleware/            # 中间件
│   │   └── errorHandler.ts    # 错误处理
│   ├── routes/               # 路由定义
│   │   ├── index.ts         # 路由注册
│   │   ├── home.routes.ts   # 首页路由
│   │   ├── users.routes.ts  # 用户数据路由
│   │   └── room.routes.ts   # 房间数据路由
│   ├── services/            # 业务逻辑服务
│   │   ├── data.service.ts  # 数据查询服务
│   │   ├── metrics.service.ts # Prometheus 指标服务
│   │   ├── user.service.ts  # 用户数据处理服务
│   │   └── room.service.ts  # 房间数据处理服务
│   ├── server.ts            # 服务器入口文件
│   └── types/               # TypeScript 类型定义
├── data_flow_diagram.md     # 数据流向图文档
├── package.json            # 项目依赖配置
├── tsconfig.json           # TypeScript 配置
└── README.md              # 项目说明文档
```

## 快速开始

### 环境要求

- Node.js 18+
- MongoDB 4.4+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env` 文件并配置以下环境变量：

```env
# 服务器端口
PORT=8000

# MongoDB 连接配置
MONGO_URL=mongodb://localhost:27017
```

### 数据库配置

确保 MongoDB 中有以下集合：

- `users`: 用户信息集合
- `rooms.objects`: 房间对象集合

### 启动服务

#### 开发模式
```bash
npm run dev
```

#### 生产模式
```bash
# 构建项目
npm run build

# 启动服务
npm start
```

服务启动后将在 `http://localhost:8000` 监听请求。

## API 接口

### 首页接口

- `GET /` - 欢迎页面
- `GET /health` - 健康检查（Kubernetes 兼容）

### 用户数据接口

- `GET /users/detail` - 获取用户级别的 Prometheus 指标

### 房间数据接口

- `GET /room` - 获取房间级别的 Prometheus 指标

## 监控指标

### 用户级别指标

| 指标名称 | 标签 | 描述 |
|---------|------|------|
| `screep_users_used_cpu` | `userName` | 用户已使用的 CPU |
| `screep_users_total_cpu` | `userName` | 用户总 CPU 配额 |
| `screep_users_GCL` | `userName` | 用户 GCL 等级 |
| `screep_users_total_room_count` | `userName` | 用户拥有的房间总数 |
| `screep_users_total_money` | `userName` | 用户总资金 |

### 房间级别指标

| 指标名称 | 标签 | 描述 |
|---------|------|------|
| `screep_users_energy` | `userName, room` | 用户在房间中的能量总量 |
| `screep_users_struct_count` | `userName, room, type` | 用户在房间中的建筑数量（按类型） |
| `screep_users_struct_cost` | `userName, room, type` | 用户在房间中的建筑总成本（按类型） |
| `screep_users_creep_count` | `userName, room` | 用户在房间中的 Creep 数量 |
| `screep_users_creep_cost_count` | `userName, room` | 用户在房间中的 Creep 总成本 |
| `screep_users_mineral_type_count` | `userName, room, type` | 用户在房间中的矿物数量（按类型） |
| `screep_room_source_energy_total` | `userName, room` | 用户在房间中的源点总能量 |

## 部署

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
EXPOSE 8000

CMD ["node", "dist/server.js"]
```

### Kubernetes 部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: screep-export
spec:
  replicas: 2
  selector:
    matchLabels:
      app: screep-export
  template:
    metadata:
      labels:
        app: screep-export
    spec:
      containers:
      - name: screep-export
        image: screep-export:latest
        ports:
        - containerPort: 8000
        env:
        - name: PORT
          value: "8000"
        - name: MONGO_URL
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: url
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: screep-export-service
spec:
  selector:
    app: screep-export
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

### Prometheus 配置

```yaml
scrape_configs:
  - job_name: 'screep-export'
    static_configs:
      - targets: ['screep-export-service:80']
    metrics_path: '/users/detail'
    scrape_interval: 30s
  - job_name: 'screep-export-rooms'
    static_configs:
      - targets: ['screep-export-service:80']
    metrics_path: '/room'
    scrape_interval: 30s
```

## 监控示例

### Grafana Dashboard 查询示例

```promql
# 用户 CPU 使用率
screep_users_used_cpu / screep_users_total_cpu * 100

# 总 GCL 等级分布
topk(10, screep_users_GCL)

# 房间能量总量
sum(screep_users_energy) by (userName, room)

# 建筑成本排名
topk(5, sum(screep_users_struct_cost) by (userName))

# Creep 成本分析
sum(screep_users_creep_cost_count) by (userName, room)
```

### 添加新指标

1. 在对应的 Service 类中定义新的 Gauge
2. 实现数据收集和聚合逻辑
3. 在更新方法中重置并设置指标值
4. 更新文档说明

### 测试

```bash
# 运行测试（待实现）
npm test

# 代码覆盖率（待实现）
npm run test:coverage
```

## 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 创建 GitHub Issue
- 发送邮件至项目维护者

## 相关文档

- [Prometheus 官方文档](https://prometheus.io/docs/)
- [Screep 游戏文档](https://docs.screeps.com/)
- [Express.js 官方文档](https://expressjs.com/)

---

**注意**: 本项目专门为 Screep 游戏数据监控设计，请确保在使用前正确配置 MongoDB 数据库连接和数据结构。