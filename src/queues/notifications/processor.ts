import { Job } from 'bullmq';
import Discord from 'discord.js';
import INotificationPayload from '../../interfaces/INotificationPayload';
import { getStatusCheckById } from '../../lib/db';
import httpNotification from '../../checks/http/notification';
import { isHttpNotifcation } from '../../checks/http/lib';

export default function makeNotificationsProcessor(discordClient: Discord.Client) {
  return async function notificationsProcessor(job: Job<INotificationPayload,undefined>): Promise<undefined> {
    const { data: { data } } = job;

    const statusCheck = await getStatusCheckById(data.statusCheckId);
    if (!statusCheck) return undefined;

    if (isHttpNotifcation(job.data)) {
      await httpNotification(job.data, discordClient, statusCheck);
    }

    return undefined;
  };
}
