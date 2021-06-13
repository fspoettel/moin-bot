import { JobsOptions } from 'bullmq';
import IConsumerQueue from '../../interfaces/IConsumerQueue';
import IProducerQueue from '../../interfaces/IProducerQueue';
import ICheck from '../../interfaces/ICheck';
import ICheckResult from '../../interfaces/ICheckResult';

import statusCheckProcessor from './processor';
import BaseQueue from '../BaseQueue';
import { QueueJob, ReturnValue } from './types';

class StatusChecksQueue
extends BaseQueue<ICheck, ReturnValue>
implements IConsumerQueue<ICheck>, IProducerQueue<ICheckResult> {
  consumer: IConsumerQueue<ICheckResult>;

  constructor(consumer: IConsumerQueue<ICheckResult>) {
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

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async add(name: string, data: ICheck, opts?: JobsOptions) {
    return this.queue.add(name, data, opts);
  }

  async onSuccess(job: QueueJob): Promise<void> {
    const { returnvalue } = job;
    if (returnvalue != null) {
      this.consumer.add('result', returnvalue, {});
    }
  }
}

export default StatusChecksQueue;
