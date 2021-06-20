import { Job } from 'bullmq';
import INotificationPayload from '../../interfaces/INotificationPayload';
import ICheckResult from '../../interfaces/ICheckResult';
import handleHttpResult from '../../checks/http/resultHandler';
import { isHttpResult } from '../../checks/http/lib';

export default async function resultsProcessor(job: Job<ICheckResult, INotificationPayload|undefined>): Promise<INotificationPayload|undefined> {
  const { data } = job;

  if (isHttpResult(data)) return handleHttpResult(data);
  return undefined;
}
