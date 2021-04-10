import {
  Job,
  JobsOptions,
  Processor,
  Queue,
  QueueScheduler,
  Worker,
  WorkerOptions,
} from 'bullmq';
import IBaseQueue from './interfaces/IBaseQueue';
import { getRedisConnection } from '../lib/helpers';
import createLogger from '../lib/logger';
import { Debugger } from 'debug';

type JobState = 'wait'|'completed'|'failed'|'active'|'delayed'|'paused';

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

    this.worker.on('completed', job => this.onSuccess(job));
    this.worker.on('failed', job => this.onError(job));
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
    return  new Worker<D, R>(this.name, processor, {
      connection: getRedisConnection(),
      ...workerOptions,
    });
  }

  async clean() {
    await this.queue.pause();

    const types: JobState[] = ['wait', 'completed', 'failed', 'active', 'delayed', 'paused'];
    await Promise.all(types.map(t => this.removeJobsForType(t)));

    const repeatableJobs = await this.queue.getRepeatableJobs();
    const repeatableJobCount = repeatableJobs.length;

    if (repeatableJobCount > 0) {
      this.log(`cleaning up ${repeatableJobCount} repeatable jobs`);

      repeatableJobs.forEach((job) => {
        this.queue.removeRepeatableByKey(job.key);
      });
    }

    await this.queue.resume();
  }

  private async removeJobsForType(type: JobState) {
    const jobs = await this.queue.getJobs(type);
    const len = jobs.length;
    if (len > 0) this.log(`cleaning up ${len} ${type} jobs`);
    return jobs.map(j => j.remove());
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
