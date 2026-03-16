/**
 * Base Repository - Enterprise Pattern for Data Access Layer
 * Implements Repository pattern with functional error handling
 */

import { PrismaClient } from '@prisma/client';
import { Result, success, failure, tryCatchAsync } from '../utils/result.js';
import { logger } from '../lib/logger.js';

export interface IRepository<T, ID = string> {
  findById(id: ID): Promise<Result<T | null, Error>>;
  findAll(options?: FindAllOptions): Promise<Result<T[], Error>>;
  create(data: Partial<T>): Promise<Result<T, Error>>;
  update(id: ID, data: Partial<T>): Promise<Result<T, Error>>;
  delete(id: ID): Promise<Result<boolean, Error>>;
  count(where?: Record<string, unknown>): Promise<Result<number, Error>>;
}

export interface FindAllOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, unknown>;
  include?: Record<string, boolean | object>;
}

export abstract class BaseRepository<T, ID = string> implements IRepository<T, ID> {
  protected readonly prisma: PrismaClient;
  protected readonly modelName: string;
  protected readonly logger;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
    this.logger = logger.child({ repository: modelName });
  }

  protected get model(): any {
    return (this.prisma as any)[this.modelName.toLowerCase()];
  }

  async findById(id: ID): Promise<Result<T | null, Error>> {
    return tryCatchAsync(async () => {
      this.logger.debug({ id }, `Finding ${this.modelName} by ID`);
      const result = await this.model.findUnique({ where: { id } });
      return result as T | null;
    });
  }

  async findAll(options: FindAllOptions = {}): Promise<Result<T[], Error>> {
    return tryCatchAsync(async () => {
      const { skip, take, orderBy, where, include } = options;
      this.logger.debug({ options }, `Finding all ${this.modelName}`);
      
      const results = await this.model.findMany({
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
        ...(orderBy && { orderBy }),
        ...(where && { where }),
        ...(include && { include }),
      });
      
      return results as T[];
    });
  }

  async create(data: Partial<T>): Promise<Result<T, Error>> {
    return tryCatchAsync(async () => {
      this.logger.debug({ data }, `Creating ${this.modelName}`);
      const result = await this.model.create({ data });
      this.logger.info({ id: result.id }, `Created ${this.modelName}`);
      return result as T;
    });
  }

  async update(id: ID, data: Partial<T>): Promise<Result<T, Error>> {
    return tryCatchAsync(async () => {
      this.logger.debug({ id, data }, `Updating ${this.modelName}`);
      const result = await this.model.update({
        where: { id },
        data,
      });
      this.logger.info({ id }, `Updated ${this.modelName}`);
      return result as T;
    });
  }

  async delete(id: ID): Promise<Result<boolean, Error>> {
    return tryCatchAsync(async () => {
      this.logger.debug({ id }, `Deleting ${this.modelName}`);
      await this.model.delete({ where: { id } });
      this.logger.info({ id }, `Deleted ${this.modelName}`);
      return true;
    });
  }

  async count(where?: Record<string, unknown>): Promise<Result<number, Error>> {
    return tryCatchAsync(async () => {
      const count = await this.model.count({ where });
      return count;
    });
  }

  async findOne(where: Record<string, unknown>): Promise<Result<T | null, Error>> {
    return tryCatchAsync(async () => {
      const result = await this.model.findFirst({ where });
      return result as T | null;
    });
  }

  async exists(where: Record<string, unknown>): Promise<Result<boolean, Error>> {
    return tryCatchAsync(async () => {
      const count = await this.model.count({ where });
      return count > 0;
    });
  }

  async transaction<R>(
    fn: (tx: PrismaClient) => Promise<R>
  ): Promise<Result<R, Error>> {
    return tryCatchAsync(async () => {
      return this.prisma.$transaction(fn);
    });
  }
}
