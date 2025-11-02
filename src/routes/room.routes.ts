import express, { type Router, type Request, type Response } from 'express';
import { DataService } from '../services/data.service.js';
import { MetricsService } from '../services/metrics.service.js';
import { RoomService } from '../services/room.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * 用户路由
 */
export function createRoomsRoutes(
  dataService: DataService,
  metricsService: MetricsService,
  roomService: RoomService,
): Router {
  const router = express.Router();

  router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const rooms = await dataService.findAllRooms();
    roomService.updateActiveRooms(rooms);
    res.set('Content-Type', metricsService.getContentType());
    res.end(await metricsService.getMetrics(roomService.getRegistry()));
  }));

  return router;
}

