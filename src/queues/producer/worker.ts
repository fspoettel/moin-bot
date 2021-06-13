import { isHttpCheck } from '../../checks/http/lib';
import { getStatusCheckById } from '../../lib/db';
import { QueueJob, ReturnValue } from './types';

export default async function producerProcessor(job: QueueJob): Promise<ReturnValue> {
  const check = await getStatusCheckById(job.data.id);
  // TODO: handle case where check is deleted
  if (check == null) return undefined;

  const { config, id: statusCheckId } = check;
  const { type, details } = config;

  const outputValue = { details, statusCheckId, type };

  if (isHttpCheck(outputValue)) return outputValue;
  return undefined;
}
