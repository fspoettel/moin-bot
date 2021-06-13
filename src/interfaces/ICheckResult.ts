import { Prisma } from '@prisma/client';

interface ICheckResult extends Record<string, Prisma.JsonValue> {
  statusCheckId: string;
  status: 'UP'|'DOWN';
  type: 'HTTP';
  details: Record<string, Prisma.JsonValue>;
}

export default ICheckResult;
