import { JobsOptions } from 'bullmq';
import Discord from 'discord.js';

import IConsumerQueue from '../../interfaces/IConsumerQueue';
import INotificationPayload from '../../interfaces/INotificationPayload';
import BaseQueue from '../BaseQueue';
import makeNotificationsProcessor from './processor';

class NotificationsQueue
extends BaseQueue<INotificationPayload, undefined>
implements IConsumerQueue<INotificationPayload> {
  constructor(discordClient: Discord.Client) {
    const notificationsProcessor = makeNotificationsProcessor(discordClient);
    super('notifications', notificationsProcessor, {
      workerOptions: { concurrency: 50 },
      defaultJobOptions: {
        removeOnComplete: true,
      }
    });
  }

  async add(name: string, data: INotificationPayload, opts?: JobsOptions) {
    return this.queue.add(name, data, opts);
  }

  async onSuccess() {
   this.log('notification sent');
  }
}

export default NotificationsQueue;
