import { Job } from 'bullmq';
import { getStatusCheckById } from '../../lib/db';
import { HttpCheckData, isHttpDetails } from '../../types';

export default async function producerProcessor(job: Job<{ id: string }, HttpCheckData|undefined>): Promise<HttpCheckData|undefined> {
  const check = await getStatusCheckById(job.data.id);
  // TODO: handle case where check is deleted
  if (check == null) return undefined;

  const { config, id: statusCheckId } = check;
  const { type, details } = config;
  return isHttpDetails(details) ? { details, statusCheckId, type } : undefined;
}
