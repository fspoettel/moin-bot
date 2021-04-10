import { Job } from 'bullmq';
import createLogger from '../../lib/logger';
import { getLastResultByStatusCheckId, storeResult } from '../../lib/db';
import { HttpCheckResult, NotificationPayload } from '../../types';

const QUEUE_NAME = 'results';
const log = createLogger(`processors:${QUEUE_NAME}`);

export default async function resultsProcessor(job: Job<HttpCheckResult,NotificationPayload|undefined>): Promise<NotificationPayload|undefined> {
  const { data } = job;
  const { details, rtt, status, statusCheckId } = data;

  const previousResult = await getLastResultByStatusCheckId(data.statusCheckId);
  const statusChanged = previousResult && previousResult.status !== data.status;

  let storedResult = null;

  // optimization: we do not need to store subsequent FAILs currently
  if (data.status === 'UP' || !previousResult || statusChanged) {
    storedResult = await storeResult(statusCheckId, status, rtt, details);
  } else {
    log(`skip storing result for ${statusCheckId} in database: ${data.status}`);
  }

  if (statusChanged) {
    return { data, result: storedResult, previousResult };
  }
  return undefined;
}
