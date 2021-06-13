import { Prisma } from '@prisma/client';

interface ICheck extends Record<string, Prisma.JsonValue> {
  statusCheckId: string;
  details: Record<string, Prisma.JsonValue>;
  type: 'HTTP';
}

export default ICheck;
