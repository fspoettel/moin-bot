import { Prisma } from '@prisma/client';
import { isJsonObject } from '../../lib/helpers';
import { Check, CheckResult, ConfigDetails, NotificationPayload } from './interfaces';

export function isHttpConfig(x: Prisma.JsonValue|null|undefined): x is ConfigDetails {
  return isJsonObject(x)
    && Object.hasOwnProperty.call(x, 'domain')
    && Object.hasOwnProperty.call(x, 'path');
}

export function isHttpCheck(x: Record<string, Prisma.JsonValue>): x is Check {
  return typeof x === 'object' &&
    x?.type === 'HTTP' &&
    isHttpConfig(x?.details);
}

export function isHttpResult(x: Record<string, Prisma.JsonValue>): x is CheckResult {
  return typeof x === 'object' &&
    x?.type === 'HTTP' &&
   (x?.status === 'UP' || x?.status === 'DOWN');
}

export function isHttpNotifcation(x: Record<string, any>): x is NotificationPayload {
  return typeof x === 'object' && isHttpResult(x?.data);
}

export function urlFromConfig(details: ConfigDetails): string {
  return `${details.protocol ?? 'https'}://${details.domain}${details.path}`;
}
