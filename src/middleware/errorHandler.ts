import type { Request, Response, NextFunction } from 'express';

/**
 * 全局错误处理中间件
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);

  // 如果响应已经发送，将错误传递给 Express 默认错误处理器
  if (res.headersSent) {
    return next(error);
  }

  // 发送错误响应
  res.status(500).send('Internal Server Error');
}

/**
 * 异步路由错误包装器
 * 用于捕获异步路由处理函数中的错误
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

