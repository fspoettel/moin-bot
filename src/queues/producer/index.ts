import { StatusCheckType } from '@prisma/client';
import IConsumerQueue from '../../interfaces/IConsumerQueue';
import IProducerQueue from '../../interfaces/IProducerQueue';
import ICheck from '../../interfaces/ICheck';

import { getStatusChecksForType } from '../../lib/db';
import BaseQueue from '../BaseQueue';

import statusCheckProducerProcessor from './worker';
import { QueueJob, Payload, ReturnValue } from './types';

class StatusCheckProducerQueue
extends BaseQueue<Payload, ReturnValue>
implements IProducerQueue<ICheck> {
  consumer: IConsumerQueue<ICheck>;

  constructor(consumer: IConsumerQueue<ICheck>) {
    super('statusCheckProducer', statusCheckProducerProcessor, {
      defaultJobOptions: {
        attempts: 1,
        removeOnFail: true,
        removeOnComplete: true,
      }
    });
    this.consumer = consumer;
  }

  async start(): Promise<void> {
    await super.start();
    await Promise.all([
      this.startStatusChecksForType('HTTP'),
    ]);
  }

  async startStatusChecksForType(type: StatusCheckType): Promise<void> {
    const statusChecks = await getStatusChecksForType(type);
    const len = statusChecks.length;

    this.log(`registering repeating jobs for ${len} ${type} status checks`);

    // TODO: consider inverting this and have "one" producer job
    // that produces n jobs
    statusChecks.forEach((check) => {
      const job = {
        id: check.id,
        type,
      };

      this.queue.add(check.id, job, {
        repeat: {
          every: typeof check.config.interval === 'number'
            ? check.config.interval * 1000
            : 60 * 1000
        },
      });
    });
  }

  async onSuccess(job: QueueJob): Promise<void> {
    const { returnvalue: data } = job;

    if (data != null) {
      const jobId = data.statusCheckId;
      this.consumer.add(data.type, data, { jobId });
    }
  }
}

export default StatusCheckProducerQueue;
