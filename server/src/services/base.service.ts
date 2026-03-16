/**
 * Base Service - Enterprise Pattern for Business Logic Layer
 * Implements Service pattern with functional error handling
 */

import { Result, isSuccess, isFailure, map, flatMap } from '../utils/result.js';
import { logger, Logger } from '../lib/logger.js';

export interface ServiceError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export const createServiceError = (
  code: string,
  message: string,
  statusCode: number = 400,
  details?: Record<string, unknown>
): ServiceError => ({
  code,
  message,
  statusCode,
  details,
});

export const ServiceErrors = {
  NOT_FOUND: (resource: string) =>
    createServiceError('NOT_FOUND', `${resource} not found`, 404),
  UNAUTHORIZED: () =>
    createServiceError('UNAUTHORIZED', 'Authentication required', 401),
  FORBIDDEN: () =>
    createServiceError('FORBIDDEN', 'Access denied', 403),
  VALIDATION: (message: string, details?: Record<string, unknown>) =>
    createServiceError('VALIDATION_ERROR', message, 400, details),
  CONFLICT: (message: string) =>
    createServiceError('CONFLICT', message, 409),
  INTERNAL: (message: string = 'Internal server error') =>
    createServiceError('INTERNAL_ERROR', message, 500),
};

export abstract class BaseService {
  protected readonly logger: Logger;
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.logger = logger.child({ service: serviceName });
  }

  protected mapResult<T, U>(
    result: Result<T, Error>,
    fn: (value: T) => U
  ): Result<U, Error> {
    return map(result, fn);
  }

  protected flatMapResult<T, U>(
    result: Result<T, Error>,
    fn: (value: T) => Result<U, Error>
  ): Result<U, Error> {
    return flatMap(result, fn);
  }

  protected handleError(error: Error): ServiceError {
    this.logger.error({ err: error }, 'Service error');
    return ServiceErrors.INTERNAL(error.message);
  }

  protected async executeWithLogging<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const startTime = Date.now();
    this.logger.debug({ operation, ...context }, `Starting ${operation}`);
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.logger.debug({ operation, duration, ...context }, `Completed ${operation}`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error({ operation, duration, error, ...context }, `Failed ${operation}`);
      throw error;
    }
  }
}

export const toServiceResult = <T>(
  result: Result<T, Error>,
  notFoundMessage?: string
): Result<T, ServiceError> => {
  if (isFailure(result)) {
    return {
      _tag: 'Failure',
      error: ServiceErrors.INTERNAL(result.error.message),
    };
  }
  if (result.value === null && notFoundMessage) {
    return {
      _tag: 'Failure',
      error: ServiceErrors.NOT_FOUND(notFoundMessage),
    };
  }
  return result as Result<T, ServiceError>;
};
