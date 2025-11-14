import { Redis } from 'ioredis';

const url = process.env.REDIS_URL ? `redis://${process.env.REDIS_HOST ?? 'redis'}:${process.env.REDIS_PORT ?? 6379}` : '';
export const redis = new Redis(url);
