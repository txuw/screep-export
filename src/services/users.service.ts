import type { Db } from 'mongodb';
import { AppConfig } from '../config/app.config.js';

/**
 * 用户服务
 * 负责处理用户相关的数据操作
 */
export class UsersService {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  /**
   * 查询所有用户
   * @returns Promise<Array<any>> 用户数据数组
   */
  async findAllUsers(): Promise<Array<any>> {
    const collection = this.db.collection(AppConfig.COLLECTION_NAME);
    return await collection.find({}).toArray();
  }
}

