import { Job } from 'bullmq';
import createLogger from '../../../lib/logger';
import { HttpCheckData, HttpCheckResult,} from '../../../types';
import httpCheck from './http';

const QUEUE_NAME = 'statusChecks';
const log = createLogger(`processors:${QUEUE_NAME}`);

export default async function statusCheckProcessor(job: Job<HttpCheckData, HttpCheckResult>): Promise<HttpCheckResult> {
  const { data } = job;
  log(`start http check for ${data.details.domain}`);
  return httpCheck(data);
}
