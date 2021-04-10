import { Job, JobsOptions } from 'bullmq';
import Discord from 'discord.js';

import IConsumerQueue from '../interfaces/IConsumerQueue';
import { NotificationPayload } from '../../types';
import BaseQueue from '../BaseQueue';
import makeNotificationsProcessor from './processor';

class NotificationsQueue
extends BaseQueue<NotificationPayload, undefined>
implements IConsumerQueue<NotificationPayload> {
  constructor(discordClient: Discord.Client) {
    const notificationsProcessor = makeNotificationsProcessor(discordClient);
    super('notifications', notificationsProcessor, {
      workerOptions: { concurrency: 50 },
      defaultJobOptions: {
        removeOnComplete: true,
      }
    });
  }

  async add(name: string, data: NotificationPayload, opts?: JobsOptions) {
    return this.queue.add(name, data, opts);
  }

  async onSuccess(job: Job<NotificationPayload, undefined>) {
   this.log('notification sent');
  }
}

export default NotificationsQueue;
