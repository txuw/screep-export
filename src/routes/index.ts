import type { Express } from 'express';
import { MongoDBService } from '../database/mongodb.service.js';
import { DataService } from '../services/data.service.js';
import { MetricsService } from '../services/metrics.service.js';
import { UserService } from '../services/user.service.js';
import { RoomService } from '../services/room.service.js';
import { createHomeRoutes } from './home.routes.js';
import { createUsersRoutes } from './users.routes.js';
import { createRoomsRoutes } from './room.routes.js';

/**
 * 注册所有路由
 */
export function registerRoutes(app: Express, mongodbService: MongoDBService): void {
  // 初始化服务
  const metricsService = new MetricsService();
  const dataService = new DataService(mongodbService.getDb());
  const userService = new UserService();
  const roomService = new RoomService();

  // 注册路由
  app.use('/', createHomeRoutes());
  app.use('/users', createUsersRoutes(dataService, metricsService,userService));
  app.use('/room', createRoomsRoutes(dataService, metricsService, roomService));
}

