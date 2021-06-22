import { Incident, PrismaClient, Result, ResultStatus, StatusCheck, StatusCheckConfig, StatusCheckType } from '@prisma/client';

const prismaClient = new PrismaClient();

type IncidentWithResults = Incident & { results: Result[] };
type StatusCheckWithConfig = StatusCheck & { config: StatusCheckConfig };
type ResultWithIncident = Result & { incident: Incident|null };

export function getStatusChecksForType(type: StatusCheckType): Promise<StatusCheckWithConfig[]> {
  return prismaClient.statusCheck.findMany({
    where: {
      config: { type }
    },
    include: { config: true },
  });
}

export function getStatusCheckById(id: string): Promise<StatusCheckWithConfig|null> {
  return prismaClient.statusCheck.findFirst({
    where: { id },
    include: { config: true },
  });
}

export function getLatestIncident(statusCheckId: string): Promise<IncidentWithResults|null> {
  return prismaClient.incident.findFirst({
    where: { statusCheckId },
    orderBy: { createdAt: 'desc' },
    include: {
      results: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });
}

export function setIncidentStatus(incidentId: string, status: 'CONFIRMED'|'RESOLVED'): Promise<Incident> {
  return prismaClient.incident.update({
    where:{ id: incidentId },
    data: {
      status,
      resolvedAt: new Date(),
    }
  });
}

export function createIncident(statusCheckId: string, status: 'CONFIRMED'|'UNCONFIRMED'): Promise<Incident> {
  return prismaClient.incident.create({
    data: {
      statusCheckId,
      status,
    }
  });
}

export function getIncidentWithResults(id: string): Promise<IncidentWithResults|null> {
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
): Promise<ResultWithIncident> {
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

export function getStatusCheckCount(): Promise<number> {
  return prismaClient.statusCheck.count();
}

export default prismaClient;
