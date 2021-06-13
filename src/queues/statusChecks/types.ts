import { Job } from 'bullmq';
import ICheck from '../../interfaces/ICheck';
import ICheckResult from '../../interfaces/ICheckResult';

export type ReturnValue = ICheckResult|undefined;
export type QueueJob = Job<ICheck, ReturnValue>;
