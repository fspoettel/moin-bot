import { PrismaClient, ResultStatus, StatusCheckType } from '@prisma/client';

const prismaClient = new PrismaClient();

export function getStatusChecksForType(type: StatusCheckType) {
  return prismaClient.statusCheck.findMany({
    where: {
      config: { type }
    },
    include: { config: true },
  });
}

export function getStatusCheckById(id: string) {
  return prismaClient.statusCheck.findFirst({
    where: { id },
    include: { config: true },
  });
}

export function getLastResultByStatusCheckId(statusCheckId: string) {
  return prismaClient.result.findFirst({
    where: { statusCheckId },
    orderBy: { createdAt: 'desc' },
  });
}

export function storeResult(statusCheckId: string, status: ResultStatus, rtt: number|null, details: Record<string, string|number|any[]>) {
  return prismaClient.result.create({
    data: {
      statusCheckId,
      status,
      rtt,
      details,
    }
  });
}

export function getStatusCheckCount() {
  return prismaClient.statusCheck.count();
}

export default prismaClient;
