import got, { RequestError, Response } from 'got';
import { urlFromDetails } from '../../../lib/helpers';
import { HttpCheckFail, HttpCheckSuccess, HttpCheckData, HttpCheckResult } from '../../../types';

export default async function httpCheck(data: HttpCheckData): Promise<HttpCheckResult> {
  try {
    const res = await httpRequest(urlFromDetails(data.details));
    return formatSuccessResponse(data.statusCheckId, res);
  } catch (err: unknown) {
    if (err instanceof RequestError) {
      return formatErrorResponse(data.statusCheckId, err);
    }
    throw err;
  }
}

function httpRequest(url: string): Promise<Response<string>> {
  return got(url, {
    headers: {
      'User-Agent': 'moin/1.0.0'
    },
    retry: 1,
    timeout: 30000,
    https: {
      rejectUnauthorized: true,
    }
  });
}

function formatSuccessResponse(statusCheckId: string, res: Response<string>): HttpCheckSuccess {
  return {
    statusCheckId,
    status: 'UP',
    rtt: res.timings.phases.total ?? 0,
    details: {},
  };
}

function formatErrorResponse(statusCheckId: string, err: RequestError): HttpCheckFail {
  return {
    statusCheckId,
    status: 'DOWN',
    rtt: err.response?.timings.phases.total ?? null,
    details: {
      code: err.response?.statusCode || err?.code || err.name,
    }
  };
}
