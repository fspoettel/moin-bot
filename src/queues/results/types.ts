import { Job } from 'bullmq';
import ICheckResult from '../../interfaces/ICheckResult';
import INotificationPayload from '../../interfaces/INotificationPayload';

export type ReturnValue = INotificationPayload|undefined;
export type QueueJob = Job<ICheckResult, ReturnValue>;
