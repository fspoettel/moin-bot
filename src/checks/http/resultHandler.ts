import { createIncident, getLatestIncident,  getStatusCheckById,  setIncidentStatus, storeResult } from '../../lib/db';
import { CheckResult, NotificationPayload } from './interfaces';

export default async function handleHttpResult(data: CheckResult): Promise<NotificationPayload|undefined> {
  const { details, rtt, status, statusCheckId } = data;

  const [statusCheck, latestIncident] = await Promise.all([
    getStatusCheckById(statusCheckId),
    getLatestIncident(statusCheckId),
  ]);

  const activeIncident = latestIncident && latestIncident.status !== 'RESOLVED'
    ? latestIncident
    : null;

  let result;

  if (data.status === 'UP') {
    if (activeIncident) await setIncidentStatus(activeIncident.id, 'RESOLVED');

    result = await storeResult(statusCheckId, status, rtt, details, activeIncident?.id);
  } else if (data.status === 'DOWN') {
    const threshold = statusCheck?.config.incidentThreshold ?? 1;

    const incident = activeIncident == null
      ? await createIncident(statusCheckId, threshold <= 1 ? 'CONFIRMED' : 'UNCONFIRMED')
      : activeIncident.status === 'UNCONFIRMED' && activeIncident.results.length >= threshold
        ? await setIncidentStatus(activeIncident.id, 'CONFIRMED')
        : activeIncident;

    result = await storeResult(statusCheckId, status, rtt, details, incident.id);
  }

  if (result?.incidentId && result.incident?.status !== latestIncident?.status) {
    return {
      incidentId: result.incidentId,
      previousStatus: activeIncident?.status,
      type: 'HTTP',
    };
  }

  return undefined;
}
