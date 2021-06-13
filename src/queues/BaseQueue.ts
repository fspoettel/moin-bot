import {
  Job,
  JobsOptions,
  Processor,
  Queue,
  QueueScheduler,
  Worker,
  WorkerOptions,
} from 'bullmq';
import IBaseQueue from '../interfaces/IBaseQueue';
import { getRedisConnection } from '../lib/helpers';
import createLogger from '../lib/logger';
import { Debugger } from 'debug';

type BaseQueueOptions = {
  defaultJobOptions?: JobsOptions,
  workerOptions?: WorkerOptions;
};

class BaseQueue<D, R> implements IBaseQueue<D, R> {
  name: string;
  queue: Queue<D, R>;
  log: Debugger;
  scheduler: QueueScheduler;
  worker: Worker<D, R>;

  constructor(name: string, processor: Processor<D, R>, opts?: BaseQueueOptions) {
    this.name = name;
    this.log = createLogger(`queues:${this.name}`);

    this.queue = this.createQueue(opts?.defaultJobOptions ?? {});
    this.scheduler = this.createScheduler();
    this.worker = this.createWorker(processor, opts?.workerOptions ?? {});
  }

  private createQueue(defaultJobOptions: JobsOptions) {
    return new Queue<D, R>(this.name, {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }

  private createScheduler() {
    return new QueueScheduler(this.name, {
      maxStalledCount: 0,
      connection: getRedisConnection(),
    });
  }

  private createWorker(processor: Processor, workerOptions: WorkerOptions) {
    const worker = new Worker<D, R>(this.name, processor, {
      connection: getRedisConnection(),
      ...workerOptions,
    });

    worker.on('completed', (job: Job<D, R>) => this.onSuccess(job));
    worker.on('failed', (job: Job<D, R>) => this.onError(job));

    return worker;
  }

  async clean() {
    await this.queue.pause();
    await this.queue.obliterate({ force: true });
    await this.queue.resume();
  }

  async start() {
    await this.queue.waitUntilReady();
    await this.clean();
  }

  async onSuccess(job: Job<D, R>) {
    throw new Error('onSuccess() requires an implementation');
  }

  async onError(job: Job<D, R>) {
    console.warn(`worker fors ${job.id} failed with reason: ${job.failedReason}`);
  }
}

export default BaseQueue;
