import { JobsOptions } from 'bullmq';
import IConsumerQueue from '../../interfaces/IConsumerQueue';
import IProducerQueue from '../../interfaces/IProducerQueue';
import ICheckResult from '../../interfaces/ICheckResult';
import INotificationPayload from '../../interfaces/INotificationPayload';
import resultProcessor from './processor';
import BaseQueue from '../BaseQueue';
import { QueueJob, ReturnValue } from './types';

class ResultsQueue
extends BaseQueue<ICheckResult, ReturnValue>
implements IConsumerQueue<ICheckResult>, IProducerQueue<INotificationPayload> {
  consumer: IConsumerQueue<INotificationPayload>;

  constructor(consumer: IConsumerQueue<ICheckResult>) {
    super('results', resultProcessor, {
      defaultJobOptions: { removeOnComplete: true },
      workerOptions: { concurrency: 50 },
    });

    this.consumer = consumer;
  }

  async add(name: string, data: ICheckResult, opts?: JobsOptions) {
    return this.queue.add(name, data, opts);
  }

  async onSuccess(job: QueueJob): Promise<void> {
    const { returnvalue: data } = job;

    if (data != null) {
      this.consumer.add('notify', data, {});
    }
  }
}

export default ResultsQueue;
