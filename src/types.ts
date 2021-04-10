import { Prisma, Result } from '.prisma/client';

export type HttpCheckData = {
  statusCheckId: string;
  details: HttpDetails;
  type: string;
};

export type HttpDetails = {
  domain: string;
  path: string;
  protocol?: string;
};

function isJsonObject(x: Prisma.JsonValue|null|undefined): x is Prisma.JsonObject {
  return x != null
    && typeof x !== 'string'
    && typeof x !== 'number'
    && !Array.isArray(x);
}

export function isHttpDetails(x: Prisma.JsonValue|null|undefined): x is HttpDetails {
  return isJsonObject(x)
    && Object.hasOwnProperty.call(x, 'domain')
    && Object.hasOwnProperty.call(x, 'path');
}

interface HttpCheckResultBase {
  statusCheckId: string;
}

export interface HttpCheckSuccess extends HttpCheckResultBase {
  status: 'UP';
  rtt: number;
  details: Record<string, never>;
}

export interface HttpCheckFail extends HttpCheckResultBase {
  status: 'DOWN';
  rtt: number|null;
  details: {
    code: number|string;
  };
}

export type HttpCheckResult = HttpCheckFail|HttpCheckSuccess;

export type NotificationPayload = {
  data: HttpCheckResult;
  // these may or may not be present:
  // - previousResult can be `null` for checks run the first time
  // - result can be `null` for subsequent failed calls
  result: Result|null;
  previousResult: Result|null;
};
