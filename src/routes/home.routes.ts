import express, { type Router, type Request, type Response } from 'express';

/**
 * 首页路由
 */
export function createHomeRoutes(): Router {
  const router = express.Router();

  router.get('/', (req: Request, res: Response) => {
    res.json({
      message: '欢迎使用 Screep Export API',
      version: '1.0.0'
    });
  });

  // Health check endpoint for Kubernetes
  router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  return router;
}

