import { Job } from 'bullmq';
import Discord from 'discord.js';
import { urlFromDetails } from '../../lib/helpers';
import { getStatusCheckById } from '../../lib/db';
import { isHttpDetails, NotificationPayload } from '../../types';
import { sendEmbedMessage } from '../../bot';

export default function makeNotificationsProcessor(discordClient: Discord.Client) {
  return async function notificationsProcessor(job: Job<NotificationPayload,undefined>): Promise<undefined> {
    const { data: { data, previousResult } } = job;

    const timestamp = Date.now();

    const statusCheck = await getStatusCheckById(data.statusCheckId);
    if (statusCheck == null || !isHttpDetails(statusCheck.config.details)) return undefined;

    const label = statusCheck.label || 'webpage';
    const checkConfigDetails = statusCheck.config.details;
    const url = urlFromDetails(checkConfigDetails);

    if (data.status === 'DOWN') {
      await sendEmbedMessage(discordClient, '@everyone', {
        description: `⚠️ ${label} is down!`,
        color: 0xff0f0f,
        fields: [
          { name: 'URL', value: url, inline: false },
          { name: 'Details', value: `HTTP ${data.details.code}`, inline: true }
        ],
        timestamp
      });
    } else {
      const fields = [
        { name: 'URL', value: url, inline: false },
        { name: 'Response Time', value: `${data.details.rtt}ms`, inline: true },
      ];

      if (previousResult) {
        const prevTime = new Date(previousResult.createdAt);
        const downTime = ((timestamp - prevTime.getTime()) / 1000 / 60).toFixed(1);
        fields.push({ name: 'Downtime', value: `${downTime}min`, inline: true });
      }

      await sendEmbedMessage(discordClient, '', {
        description: `✅ ${label} is back up!`,
        color: 0x2E7D32,
        fields,
        timestamp
      });
    }

    return undefined;
  };
}
