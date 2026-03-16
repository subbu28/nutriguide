import pino from 'pino';
import { config } from '../config/index.js';

const isDev = config.isDev;

export const logger = pino({
  level: config.logLevel || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    service: 'nutriguide-api',
    version: process.env.npm_package_version || '1.0.0',
  },
  redact: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token'],
});

export const createChildLogger = (context: Record<string, unknown>) => {
  return logger.child(context);
};

export type Logger = typeof logger;

export const logRequest = (req: any, res: any, responseTime: number) => {
  const { method, url, headers } = req;
  const { statusCode } = res;
  
  const logData = {
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: headers['user-agent'],
    ip: headers['x-forwarded-for'] || req.socket?.remoteAddress,
  };

  if (statusCode >= 500) {
    logger.error(logData, 'Request error');
  } else if (statusCode >= 400) {
    logger.warn(logData, 'Request warning');
  } else {
    logger.info(logData, 'Request completed');
  }
};

export const logError = (error: Error, context?: Record<string, unknown>) => {
  logger.error(
    {
      err: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    },
    'Error occurred'
  );
};

export const logAudit = (
  action: string,
  userId: string,
  details: Record<string, unknown>
) => {
  logger.info(
    {
      audit: true,
      action,
      userId,
      ...details,
      timestamp: new Date().toISOString(),
    },
    `Audit: ${action}`
  );
};
