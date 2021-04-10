import { Job, JobsOptions } from 'bullmq';
import IConsumerQueue from '../interfaces/IConsumerQueue';
import IProducerQueue from '../interfaces/IProducerQueue';
import { HttpCheckResult, NotificationPayload } from '../../types';
import resultProcessor from './processor';
import BaseQueue from '../BaseQueue';

type ResultReturnValue = NotificationPayload|undefined;

class ResultsQueue
extends BaseQueue<HttpCheckResult, ResultReturnValue>
implements IConsumerQueue<HttpCheckResult>, IProducerQueue<HttpCheckResult> {
  consumer: IConsumerQueue<HttpCheckResult>;

  constructor(consumer: IConsumerQueue<HttpCheckResult>) {
    super('results', resultProcessor, {
      defaultJobOptions: { removeOnComplete: true },
      workerOptions: { concurrency: 50 },
    });

    this.consumer = consumer;
  }

  async add(name: string, data: HttpCheckResult, opts?: JobsOptions) {
    return this.queue.add(name, data, opts);
  }

  async onSuccess(job: Job<HttpCheckResult, ResultReturnValue>) {
    const { returnvalue: data } = job;

    if (data != null) {
      this.consumer.add('notify', data, {});
    }
  }
}

export default ResultsQueue;
