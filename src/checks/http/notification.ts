import Discord from 'discord.js';
import { sendEmbedMessage } from '../../bot';
import { getIncidentWithResults, getStatusCheckById } from '../../lib/db';
import { isHttpConfig, urlFromConfig } from './lib';
import { NotificationPayload } from './interfaces';

function isErrorDetails(x: unknown): x is { code: string|number } {
  return typeof x === 'object' &&
  Object.hasOwnProperty.call(x, 'code');
}

export default async function httpNotification(
  payload: NotificationPayload,
  discordClient: Discord.Client
): Promise<void> {
  const { incidentId, previousStatus, type } = payload;

  const incident = await getIncidentWithResults(incidentId);

  if (incident == null) return;
  if (incident.status === previousStatus || incident.status === 'NEW') return;

  const statusCheck = await getStatusCheckById(incident.statusCheckId);
  if (!statusCheck || !isHttpConfig(statusCheck.config.details) || type !== 'HTTP') throw new TypeError('unexpected config format;');

  const timestamp = Date.now();

  const label = statusCheck.label || 'webpage';
  const checkConfigDetails = statusCheck.config.details;
  const url = urlFromConfig(checkConfigDetails);

  const currentResult = incident.results[incident.results.length - 1];

  if (incident.status === 'ONGOING' && previousStatus !== 'ONGOING') {
    if (!isErrorDetails(currentResult.details)) throw new Error('current result has unexpected format');

    await sendEmbedMessage(discordClient, '@everyone', {
      description: `⚠️ ${label} is down!`,
      color: 0xff0f0f,
      fields: [
        { name: 'URL', value: url, inline: false },
        { name: 'Details', value: `HTTP ${currentResult.details.code}`, inline: true }
      ],
      timestamp
    });
  } else if (incident.status === 'RESOLVED' && previousStatus === 'ONGOING') {
    const fields = [
      { name: 'URL', value: url, inline: false },
      { name: 'Response Time', value: `${currentResult.rtt}ms`, inline: true },
    ];

    const prevTime = new Date(incident.results[0].createdAt);
    const downTime = ((timestamp - prevTime.getTime()) / 1000 / 60).toFixed(1);
    fields.push({ name: 'Downtime', value: `${downTime}min`, inline: true });

    await sendEmbedMessage(discordClient, '', {
      description: `✅ ${label} is back up!`,
      color: 0x2E7D32,
      fields,
      timestamp
    });
  }
}
