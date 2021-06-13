import { Result } from '@prisma/client';
import INotificationPayload from '../../interfaces/INotificationPayload';
import { storeResult } from '../../lib/db';
import createLogger from '../../lib/logger';
import { CheckResult } from './interfaces';

function hasStatusChanged(data: CheckResult, previousResult: Result|null) {
  return previousResult && previousResult.status !== data.status;
}

const log = createLogger(`resultHandler:http`);

export default async function handleHttpResult(data: CheckResult, previousResult: Result|null): Promise<INotificationPayload|undefined> {
  const { details, rtt, status, statusCheckId } = data;

  const statusChanged = hasStatusChanged(data, previousResult);

  let storedResult = null;

  // optimization: we do not need to store subsequent FAILs currently
  if (data.status === 'UP' || !previousResult || statusChanged) {
    storedResult = await storeResult(statusCheckId, status, rtt, details);
  } else {
    log(`skip storing result for ${statusCheckId} in database: ${data.status}`);
  }

  if (statusChanged || !previousResult) {
    return { data, result: storedResult, previousResult };
  }
  return undefined;
}
