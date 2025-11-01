import express, { type Router, type Request, type Response } from 'express';
import { UsersService } from '../services/users.service.js';
import { MetricsService } from '../services/metrics.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * 用户路由
 */
export function createUsersRoutes(
  usersService: UsersService,
  metricsService: MetricsService
): Router {
  const router = express.Router();

  router.get('/detail', asyncHandler(async (req: Request, res: Response) => {
    const users = await usersService.findAllUsers();
    metricsService.updateActiveUsers(users);
    res.set('Content-Type', metricsService.getContentType());
    res.end(await metricsService.getMetrics());
  }));

  return router;
}

