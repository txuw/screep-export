import 'dotenv/config';

/**
 * 应用配置
 */
export const AppConfig = {
  PORT: parseInt(process.env.PORT as string) || 8000,
    DB_NAME: 'screeps',
    USER_COLLECTION_NAME: 'users',
    ROOM_OBJ_COLLECTION_NAME: 'rooms.objects',
} as const;

