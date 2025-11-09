# Screep Export

A Node.js application for exporting Screep game data in Prometheus format.

**Languages:** [English](README.md) | [中文](README.zh.md)

## Project Background

- [Screep Private Server Metrics Dashboard Implementation](https://blog.txuw.top/archives/screep-zhi-biao-kan-ban-shi-jian)

## Project Introduction

Screep Export is a professional data export service that extracts Screep game data from MongoDB databases and converts it into Prometheus-compatible metric formats. The system supports multi-dimensional data monitoring at both user and room levels, providing comprehensive data insights for game operations.

## Features

- 🎮 **Comprehensive Data Collection**: Complete data collection for user information and room objects
- 📊 **Rich Monitoring Metrics**: Multi-dimensional metrics including CPU usage, GCL level, resource storage, building costs
- 🏷️ **Flexible Labeling System**: Data classification by username, room, type, and other dimensions
- 💰 **Cost Calculation**: Automatic calculation of Creep and building construction costs
- 🔧 **Real-time Data Updates**: Latest game data retrieved on every request
- 🚀 **High-performance Architecture**: High-performance architecture based on Express.js and MongoDB connection pooling
- 📈 **Prometheus Compatible**: Fully compatible with Prometheus monitoring system
- 🏥 **Health Check**: Built-in health check endpoint supporting Kubernetes deployment

## Tech Stack

- **Backend Framework**: Express.js 5.x
- **Database**: MongoDB
- **Language**: TypeScript
- **Monitoring**: Prometheus + prom-client
- **Runtime**: Node.js
- **Development Tools**: tsx (development), ts-node (build)

## Project Structure

```
screep_export/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── app.config.ts      # Application configuration
│   │   └── database.config.ts # Database configuration
│   ├── database/              # Database services
│   │   └── mongodb.service.ts # MongoDB connection management
│   ├── middleware/            # Middleware
│   │   └── errorHandler.ts    # Error handling
│   ├── routes/               # Route definitions
│   │   ├── index.ts         # Route registration
│   │   ├── home.routes.ts   # Home route
│   │   ├── users.routes.ts  # User data route
│   │   └── room.routes.ts   # Room data route
│   ├── services/            # Business logic services
│   │   ├── data.service.ts  # Data query service
│   │   ├── metrics.service.ts # Prometheus metrics service
│   │   ├── user.service.ts  # User data processing service
│   │   └── room.service.ts  # Room data processing service
│   ├── server.ts            # Server entry file
│   └── types/               # TypeScript type definitions
├── data_flow_diagram.md     # Data flow diagram documentation
├── package.json            # Project dependencies configuration
├── tsconfig.json           # TypeScript configuration
└── README.md              # Project documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 4.4+
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Create a `.env` file and configure the following environment variables:

```env
# Server port
PORT=8000

# MongoDB connection configuration
MONGO_URL=mongodb://localhost:27017
```

### Database Configuration

Ensure MongoDB has the following collections:

- `users`: User information collection
- `rooms.objects`: Room objects collection

### Start Service

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
# Build project
npm run build

# Start service
npm start
```

The service will listen for requests at `http://localhost:8000` after startup.

## API Endpoints

### Home Endpoints

- `GET /` - Welcome page
- `GET /health` - Health check (Kubernetes compatible)

### User Data Endpoints

- `GET /users/detail` - Get user-level Prometheus metrics

### Room Data Endpoints

- `GET /room` - Get room-level Prometheus metrics

## Monitoring Metrics

### User-level Metrics

| Metric Name | Labels | Description |
|-------------|--------|-------------|
| `screep_users_used_cpu` | `userName` | User's used CPU |
| `screep_users_total_cpu` | `userName` | User's total CPU quota |
| `screep_users_GCL` | `userName` | User's GCL level |
| `screep_users_total_room_count` | `userName` | Total number of rooms owned by user |
| `screep_users_total_money` | `userName` | User's total credits |

### Room-level Metrics

| Metric Name | Labels | Description |
|-------------|--------|-------------|
| `screep_users_energy` | `userName, room` | Total energy in user's room |
| `screep_users_struct_count` | `userName, room, type` | Number of structures in user's room (by type) |
| `screep_users_struct_cost` | `userName, room, type` | Total cost of structures in user's room (by type) |
| `screep_users_creep_count` | `userName, room` | Number of creeps in user's room |
| `screep_users_creep_cost_count` | `userName, room` | Total cost of creeps in user's room |
| `screep_users_mineral_type_count` | `userName, room, type` | Number of minerals in user's room (by type) |
| `screep_room_source_energy_total` | `userName, room` | Total source energy in user's room |

## Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
EXPOSE 8000

CMD ["node", "dist/server.js"]
```

### Kubernetes Deployment

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

### Prometheus Configuration

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

## Monitoring Examples

### Grafana Dashboard Query Examples

```promql
# User CPU usage percentage
screep_users_used_cpu / screep_users_total_cpu * 100

# Top GCL level distribution
topk(10, screep_users_GCL)

# Total room energy
sum(screep_users_energy) by (userName, room)

# Building cost ranking
topk(5, sum(screep_users_struct_cost) by (userName))

# Creep cost analysis
sum(screep_users_creep_cost_count) by (userName, room)
```

### Adding New Metrics

1. Define new Gauge in corresponding Service class
2. Implement data collection and aggregation logic
3. Reset and set metric values in update method
4. Update documentation

### Testing

```bash
# Run tests (to be implemented)
npm test

# Code coverage (to be implemented)
npm run test:coverage
```

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or suggestions, please contact us through:

- Create a GitHub Issue
- Send email to project maintainers

## Related Documentation

- [Prometheus Official Documentation](https://prometheus.io/docs/)
- [Screep Game Documentation](https://docs.screeps.com/)
- [Express.js Official Documentation](https://expressjs.com/)

---

**Note**: This project is specifically designed for Screep game data monitoring. Please ensure MongoDB database connection and data structure are properly configured before use.