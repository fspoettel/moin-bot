import { StatusCheckType } from '@prisma/client';
import { Job } from 'bullmq';
import ICheck from '../../interfaces/ICheck';

export type Payload = {
  id: string,
  type: StatusCheckType,
};

export type ReturnValue = ICheck|undefined;
export type QueueJob = Job<Payload, ReturnValue>;
