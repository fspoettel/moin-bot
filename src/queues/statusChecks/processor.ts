import createLogger from '../../lib/logger';
import { QueueJob, ReturnValue } from './types';

import httpCheck from '../../checks/http/statusCheck';
import { isHttpCheck } from '../../checks/http/lib';

const QUEUE_NAME = 'statusChecks';
const log = createLogger(`processors:${QUEUE_NAME}`);

export default async function statusCheckProcessor(job: QueueJob): Promise<ReturnValue> {
  const { data } = job;

  if (isHttpCheck(data)) {
    log(`start http check for ${data.details.domain}`);
    return httpCheck(data);
  }

  return undefined;
}
