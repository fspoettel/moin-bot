import { Job, JobsOptions } from 'bullmq';

 interface IConsumerQueue<D> {
  add(name: string, data: any, opts?: JobsOptions): Promise<Job>;
}

export default IConsumerQueue;
