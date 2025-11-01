import 'dotenv/config';

/**
 * 应用配置
 */
export const AppConfig = {
  PORT: parseInt(process.env.PORT as string) || 8000,
  DB_NAME: 'screeps',
  COLLECTION_NAME: 'users',
} as const;

