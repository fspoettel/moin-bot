import INotificationPayload from 'src/interfaces/INotificationPayload';
import ICheck from '../../interfaces/ICheck';
import ICheckResult from '../../interfaces/ICheckResult';

export type ConfigDetails = {
  domain: string;
  path: string;
  protocol?: string;
};

export interface Check extends ICheck {
  details: ConfigDetails;
  type: 'HTTP';
}

export interface CheckResultUp extends ICheckResult {
  type: 'HTTP';
  status: 'UP';
  rtt: number;
  details: Record<string, never>;
}

export interface CheckResultDown extends ICheckResult {
  type: 'HTTP';
  status: 'DOWN';
  rtt: number|null;
  details: {
    code: number|string;
  };
}

export type CheckResult = CheckResultUp|CheckResultDown;

export interface NotificationPayload extends INotificationPayload {
  type: 'HTTP';
}
