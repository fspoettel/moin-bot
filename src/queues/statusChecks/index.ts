import { Job, JobsOptions } from 'bullmq';
import IConsumerQueue from '../interfaces/IConsumerQueue';
import IProducerQueue from '../interfaces/IProducerQueue';
import { HttpCheckData, HttpCheckResult } from '../../types';
import statusCheckProcessor from './processor';
import BaseQueue from '../BaseQueue';

class StatusChecksQueue
extends BaseQueue<HttpCheckData, HttpCheckResult>
implements IConsumerQueue<HttpCheckData>, IProducerQueue<HttpCheckResult> {
  consumer: IConsumerQueue<HttpCheckResult>;

  constructor(consumer: IConsumerQueue<HttpCheckResult>) {
    super('statusChecks', statusCheckProcessor, {
      workerOptions: { concurrency: 25 },
      defaultJobOptions: {
        attempts: 0,
        removeOnComplete: true,
        removeOnFail: true,
        timeout: 30000,
      }
    });
    this.consumer = consumer;
  }

  async add(name: string, data: HttpCheckData, opts?: JobsOptions) {
    return this.queue.add(name, data, opts);
  }

  async onSuccess(job: Job<HttpCheckData, HttpCheckResult>) {
    const { returnvalue } = job;
    this.consumer.add('result', returnvalue, {});
  }
}

export default StatusChecksQueue;
