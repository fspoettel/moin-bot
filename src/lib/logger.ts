import debug, { Debugger } from 'debug';

function createLogger(namespace: string): Debugger {
  return debug('app').extend(namespace);
}

export default createLogger;
