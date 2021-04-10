import { Job } from 'bullmq';
import { getStatusChecksForType } from '../../lib/db';
import IConsumerQueue from '../interfaces/IConsumerQueue';
import IProducerQueue from '../interfaces/IProducerQueue';
import { HttpCheckData } from '../../types';
import statusCheckProducerProcessor from './worker';
import BaseQueue from '../BaseQueue';

class StatusCheckProducerQueue
extends BaseQueue<{ id: string }, HttpCheckData|undefined>
implements IProducerQueue<HttpCheckData> {
  consumer: IConsumerQueue<HttpCheckData>;

  constructor(consumer: IConsumerQueue<HttpCheckData>) {
    super('statusCheckProducer', statusCheckProducerProcessor, {
      defaultJobOptions: {
        attempts: 1,
        removeOnFail: true,
        removeOnComplete: true,
      }
    });
    this.consumer = consumer;
  }

  async start() {
    await super.start();
    const httpStatusChecks = await getStatusChecksForType('HTTP');
    const len = httpStatusChecks.length;
    this.log(`registering repeating jobs for ${len} status checks`);

    const interval = 60 * 1000;

    // TODO: consider inverting this and have "one" producer job
    // that produces n jobs
    httpStatusChecks.forEach((check) => {
      this.queue.add(check.id, { id: check.id }, {
        repeat: { every: interval },
      });
    });
  }

  async onSuccess(job: Job<{ id: string }, HttpCheckData|undefined>) {
    const { returnvalue: data } = job;

    if (data != null) {
      const jobId = data.statusCheckId;
      this.consumer.add(data.type, data, { jobId });
    }
  }
}

export default StatusCheckProducerQueue;
