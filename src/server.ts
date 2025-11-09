import express from 'express';
import { AppConfig } from './config/app.config.js';
import { MongoDBService } from './database/mongodb.service.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const mongodbService = new MongoDBService();

/**
 * 启动服务器
 */
async function startServer(): Promise<void> {
  try {
    // 先连接数据库
    await mongodbService.connect();

    // 注册路由
    registerRoutes(app, mongodbService);

    // 注册错误处理中间件（必须在最后）
    app.use(errorHandler);

    // 启动 HTTP 服务器
    app.listen(AppConfig.PORT, '0.0.0.0', () => {
      console.log(`Exporter listening at http://localhost:${AppConfig.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * 优雅关闭处理
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`${signal} signal received: closing MongoDB connection`);
  try {
    await mongodbService.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// 注册信号处理器
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 启动应用
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
