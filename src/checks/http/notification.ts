import Discord from 'discord.js';
import { sendEmbedMessage } from '../../bot';
import { StatusCheck, StatusCheckConfig } from '.prisma/client';
import { isHttpConfig, urlFromConfig } from './lib';
import { NotificationPayload } from './interfaces';

type StatusCheckWithConfig = (StatusCheck & {
  config: StatusCheckConfig;
});

export default async function httpNotification(
  payload: NotificationPayload,
  discordClient: Discord.Client,
  statusCheck: StatusCheckWithConfig
): Promise<void> {
  const { data, previousResult } = payload;

  if (!isHttpConfig(statusCheck.config.details) || data.type !== 'HTTP') throw new TypeError('unexpected config format;');

  const timestamp = Date.now();

  const label = statusCheck.label || 'webpage';
  const checkConfigDetails = statusCheck.config.details;
  const url = urlFromConfig(checkConfigDetails);

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
      { name: 'Response Time', value: `${data.rtt}ms`, inline: true },
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
}
