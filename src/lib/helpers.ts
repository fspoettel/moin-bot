import Redis from 'ioredis';
import { HttpDetails } from '../types';
import { getStatusCheckCount } from './db';

export function getRedisConnection(opts = {}) {
  const { REDIS_URL } = process.env;
  if (!REDIS_URL) throw new Error('missing redis env variables');
  return new Redis(REDIS_URL, opts);
}

export function urlFromDetails(details: HttpDetails): string {
  return `${details.protocol ?? 'https'}://${details.domain}${details.path}`;
}

export async function testRedisConnection(): Promise<void> {
  const conn = getRedisConnection({
    autoResubscribe: false,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 0,
  });

  try {
    await conn.connect();
    await conn.info();
  } catch (err) {
    console.error(err);
    throw new Error('redis could not connect on startup.');
  } finally {
    await conn.disconnect();
  }
}

export async function testPrismaConnection(): Promise<void> {
  await getStatusCheckCount();
}
