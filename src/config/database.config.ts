import { type MongoClientOptions } from 'mongodb';
import 'dotenv/config';

/**
 * MongoDB 连接配置
 */
export const MONGO_URL = process.env.MONGO_URL || '';

/**
 * MongoDB 客户端连接选项
 */
export const clientOptions: MongoClientOptions = {
  maxPoolSize: 50, // 最大连接数（根据你的并发需求调整）
  minPoolSize: 5, // 最小保持的连接数
  maxIdleTimeMS: 30000, // 空闲连接30秒后关闭
  connectTimeoutMS: 10000, // 10秒连接超时
  socketTimeoutMS: 45000, // 45秒操作超时
  serverSelectionTimeoutMS: 5000, // 5秒服务器选择超时
  retryWrites: true,
  retryReads: true,
};

