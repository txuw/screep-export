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

    async findAllRooms(): Promise<Array<any>> {
        // 第一步：查询有 email 的用户的 _id
        const usersCollection = this.db.collection(AppConfig.USER_COLLECTION_NAME);
        const usersWithEmail = await usersCollection.find({
            email: {
                $exists: true,
                $nin: [null, '', undefined]
            }
        }).project({_id: 1, username: 1,rooms:1}).toArray();

        // 提取 _id 数组
        const userIds = usersWithEmail.map(user => user._id.toString());
        const rooms = new Array<string>();
        const userNameMap = new Map()
        for (let document of usersWithEmail) {
            var id = document._id.toString();
            var userName = document.username?.toString() || '';
            userNameMap.set(id, userName);

            // 正确处理房间数据：如果 rooms 是数组，则展开；如果是字符串，直接添加
            if (document.rooms) {
                if (Array.isArray(document.rooms)) {
                    rooms.push(...document.rooms);
                } else {
                    rooms.push(document.rooms.toString());
                }
            }
        }
        // 第二步：如果没有任何符合条件的用户或房间，返回空数组
        if (userIds.length === 0 || rooms.length === 0) {
            return [];
        }

        // 去重房间列表
        const uniqueRooms = [...new Set(rooms.filter(room => room && room.trim() !== ''))];

        // 第三步：构建查询条件
        const matchCondition: any = { user: { $in: userIds } };

        // 只有在有有效房间时才添加房间过滤条件
        if (uniqueRooms.length > 0) {
            matchCondition.room = { $in: uniqueRooms };
        }

        // 第四步：查询 room objects（注意：需要 await）
        const roomObjsCollection = this.db.collection(AppConfig.ROOM_OBJ_COLLECTION_NAME);
        const roomObjs = await roomObjsCollection.find(matchCondition).toArray();

        // 第五步：设置用户名
        roomObjs.forEach(room => {
            room.user = userNameMap.get(room.user) || '';
        });

        // 返回结果
        return roomObjs;
    }
}

