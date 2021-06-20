import got, { RequestError, Response } from 'got';
import { Check, CheckResult, CheckResultDown, CheckResultUp } from './interfaces';
import { urlFromConfig } from './lib';

export default async function httpCheck(data: Check): Promise<CheckResult> {
  try {
    const res = await httpRequest(urlFromConfig(data.details));
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

function formatSuccessResponse(statusCheckId: string, res: Response<string>): CheckResultUp {
  return {
    statusCheckId,
    status: 'UP',
    rtt: res.timings.phases.total ?? 0,
    details: {},
    type: 'HTTP',
  };
}

function formatErrorResponse(statusCheckId: string, err: RequestError): CheckResultDown {
  return {
    statusCheckId,
    status: 'DOWN',
    type: 'HTTP',
    rtt: err.response?.timings.phases.total ?? null,
    details: {
      code: err.response?.statusCode || err?.code || err.name,
    }
  };
}
