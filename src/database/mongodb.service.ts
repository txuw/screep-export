import { MongoClient, type Db } from 'mongodb';
import { MONGO_URL, clientOptions } from '../config/database.config.js';
import { AppConfig } from '../config/app.config.js';

/**
 * MongoDB 数据库服务
 * 负责管理数据库连接的创建、获取和关闭
 */
export class MongoDBService {
  private client: MongoClient;
  private db: Db | null = null;
  private isConnected = false;

  constructor() {
    this.client = new MongoClient(MONGO_URL, clientOptions);
  }

  /**
   * 连接到 MongoDB 数据库
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      await this.client.connect();
      this.db = this.client.db(AppConfig.DB_NAME);
      this.isConnected = true;
      console.log('MongoDB connected successfully');
      console.log(`Connection pool ready. Max connections: ${clientOptions.maxPoolSize}`);
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * 获取数据库实例
   * @throws {Error} 如果数据库未连接
   */
  getDb(): Db {
    if (!this.db || !this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.close();
      this.db = null;
      this.isConnected = false;
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }

  /**
   * 检查连接状态
   */
  isDatabaseConnected(): boolean {
    return this.isConnected;
  }
}

