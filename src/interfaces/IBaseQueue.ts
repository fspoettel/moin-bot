import { Queue, QueueScheduler, Worker, Job } from 'bullmq';

interface IBaseQueue<D, R> {
  name: string;
  queue: Queue<D, R>;
  worker: Worker<D, R>;
  scheduler: QueueScheduler;

  clean(): Promise<void>;
  start(): Promise<void>;

  onError(job: Job<D, R>): Promise<void>;
  onSuccess(job: Job<D, R>): Promise<void>;
}

export default IBaseQueue;
