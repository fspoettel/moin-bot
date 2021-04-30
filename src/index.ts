import * as dotenv from 'dotenv';
dotenv.config();

import { getDiscordClient, setPresenceOnline } from './bot';
import createLogger from './lib/logger';

import NotificationsQueue from './queues/notifications';
import ResultsQueue from './queues/results';
import StatusCheckProducerQueue from './queues/producer';
import StatusChecksQueue from './queues/statusChecks';
import { testPrismaConnection, testRedisConnection } from './lib/helpers';

const log = createLogger('main');

async function main() {
  try {
    log('booting application; time:', Date.now());
    await Promise.all([
      testRedisConnection(),
      testPrismaConnection()
    ]);

    const discordClient = await getDiscordClient();

    const notificationsQueue = new NotificationsQueue(discordClient);
    const resultsQueue = new ResultsQueue(notificationsQueue);
    const statusChecksQueue = new StatusChecksQueue(resultsQueue);

    await Promise.all([
      statusChecksQueue.start(),
      resultsQueue.start(),
      notificationsQueue.start(),
    ]);

    const statusCheckProducerQueue = new StatusCheckProducerQueue(statusChecksQueue);
    await statusCheckProducerQueue.start();
    await setPresenceOnline(discordClient, 'keepalive();');
  } catch (err) {
    console.error(err);
    process.exit(0);
  }
}

main();
