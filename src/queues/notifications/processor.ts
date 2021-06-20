import { Job } from 'bullmq';
import Discord from 'discord.js';
import INotificationPayload from '../../interfaces/INotificationPayload';
import httpNotification from '../../checks/http/notification';
import { isHttpNotifcation } from '../../checks/http/lib';

export default function makeNotificationsProcessor(discordClient: Discord.Client) {
  return async function notificationsProcessor(job: Job<INotificationPayload,undefined>): Promise<undefined> {
    if (isHttpNotifcation(job.data)) {
      await httpNotification(job.data, discordClient);
    }
    return undefined;
  };
}
