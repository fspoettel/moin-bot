import Redis from 'ioredis';
import { HttpDetails } from '../types';

export function getRedisConnection() {
  const { REDIS_URL } = process.env;
  if (!REDIS_URL) throw new Error('missing redis env variables');
  return new Redis(REDIS_URL, {});
}

export function urlFromDetails(details: HttpDetails): string {
  return `${details.protocol ?? 'https'}://${details.domain}${details.path}`;
}
