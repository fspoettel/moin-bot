import { Incident, PrismaClient, Result, ResultStatus, StatusCheckType } from '@prisma/client';

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

export function getLatestIncident(statusCheckId: string) {
  return prismaClient.incident.findFirst({
    where: { statusCheckId },
    orderBy: { createdAt: 'desc' },
  });
}

export function setIncidentStatus(incidentId: string, status: 'ONGOING'|'RESOLVED') {
  return prismaClient.incident.update({
    where:{ id: incidentId },
    data: {
      status,
      resolvedAt: new Date(),
    }
  });
}

export function createIncident(statusCheckId: string) {
  return prismaClient.incident.create({
    data: {
      statusCheckId,
      status: 'ONGOING',
    }
  });
}

export function getIncidentWithResults(id: string) {
  return prismaClient.incident.findFirst({
    where: { id },
    include: {
      results: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });
}

export function storeResult(
  statusCheckId: string,
  status: ResultStatus,
  rtt: number|null,
  details: Record<string, string|number|any[]>,
  incidentId?: string
): Promise<Result & { incident: Incident|null }> {
  return prismaClient.result.create({
    data: {
      incidentId,
      statusCheckId,
      status,
      rtt,
      details,
    },
    include: { incident: true },
  });
}

export function getStatusCheckCount() {
  return prismaClient.statusCheck.count();
}

export default prismaClient;
