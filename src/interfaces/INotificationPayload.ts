import { Result } from '@prisma/client';
import ICheckResult from './ICheckResult';

interface INotificationPayload {
  data: ICheckResult;
  // these may or may not be present:
  // - previousResult can be `null` for checks run the first time
  // - result can be `null` for subsequent failed calls
  result: Result|null;
  previousResult: Result|null;
}

export default INotificationPayload;
