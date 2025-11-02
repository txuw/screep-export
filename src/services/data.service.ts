import type {Db} from 'mongodb';
import {AppConfig} from '../config/app.config.js';

/**
 * 用户服务
 * 负责处理用户相关的数据操作
 */
export class DataService {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * 查询所有用户
     * @returns Promise<Array<any>> 用户数据数组
     */
    async findAllUsers(): Promise<Array<any>> {
        const collection = this.db.collection(AppConfig.USER_COLLECTION_NAME);
        return await collection.find({
            "email": {
                $exists: true,
                $nin: [null, '', undefined]
            }
        }).toArray();
    }

    async findAllRooms(): Promise<{objs:Array<any>,users:Map<string,string>  }> {
        // 第一步：查询有 email 的用户的 _id
        const usersCollection = this.db.collection(AppConfig.USER_COLLECTION_NAME);
        const usersWithEmail = await usersCollection.find({
            email: {
                $exists: true,
                $nin: [null, '', undefined]
            }
        }).project({_id: 1, userName: 1}).toArray();

        // 提取 _id 数组
        const userIds = usersWithEmail.map(user => user._id.toString());

        const userNameMap = new Map()
        for (let document of usersWithEmail) {
            var id = document._id.toString();
            var userName = document.username.toString();
            userNameMap.set(id, userName);
        }
        // 第二步：如果没有任何符合条件的用户，返回空数组
        if (userIds.length === 0) {
            return {
                objs: [],
                users:  userNameMap
            };
        }

        // 第三步：使用 _id 数组查询 rooms（注意：需要 await）
        const roomsCollection = this.db.collection(AppConfig.ROOM_OBJ_COLLECTION_NAME);
        const rooms = await roomsCollection.find({
            user: {$in: userIds}
        }).toArray();

        // 返回结果
        return {
            objs: rooms,
            users: userNameMap
        };
    }
}

