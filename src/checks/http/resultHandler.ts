import { createIncident, getLatestIncident,  setIncidentStatus, storeResult } from '../../lib/db';
import { CheckResult, NotificationPayload } from './interfaces';

export default async function handleHttpResult(data: CheckResult): Promise<NotificationPayload|undefined> {
  const { details, rtt, status, statusCheckId } = data;

  const latestIncident = await getLatestIncident(statusCheckId);

  const activeIncident = latestIncident != null && latestIncident.status !== 'RESOLVED'
    ? latestIncident
    : null;

  let result;

  if (data.status === 'UP') {
      // TODO: take into account `incidentThreshold`
    if (activeIncident) await setIncidentStatus(activeIncident.id, 'RESOLVED');

    result = await storeResult(statusCheckId, status, rtt, details, activeIncident?.id);
  } else if (data.status === 'DOWN') {
    const incident = activeIncident
      // TODO: take into account `incidentThreshold`
      ? await setIncidentStatus(activeIncident.id, 'ONGOING')
      : await createIncident(statusCheckId);

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
