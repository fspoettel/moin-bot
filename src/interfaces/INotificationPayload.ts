import { IncidentStatus } from '@prisma/client';

interface INotificationPayload {
  incidentId: string;
  previousStatus?: IncidentStatus
}

export default INotificationPayload;
