import type { Express } from 'express';
import { MongoDBService } from '../database/mongodb.service.js';
import { UsersService } from '../services/users.service.js';
import { MetricsService } from '../services/metrics.service.js';
import { createHomeRoutes } from './home.routes.js';
import { createUsersRoutes } from './users.routes.js';

/**
 * 注册所有路由
 */
export function registerRoutes(app: Express, mongodbService: MongoDBService): void {
  // 初始化服务
  const metricsService = new MetricsService();
  const usersService = new UsersService(mongodbService.getDb());

  // 注册路由
  app.use('/', createHomeRoutes());
  app.use('/users', createUsersRoutes(usersService, metricsService));
}

