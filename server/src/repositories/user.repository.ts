/**
 * User Repository - Data Access Layer for User Entity
 */

import { User } from '@prisma/client';
import { BaseRepository, FindAllOptions } from './base.repository.js';
import { prisma } from '../lib/prisma.js';
import { Result, tryCatchAsync } from '../utils/result.js';

export interface UserWithRelations extends User {
  settings?: any;
  favorites?: any[];
  familyMemberships?: any[];
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(prisma, 'User');
  }

  async findByEmail(email: string): Promise<Result<User | null, Error>> {
    return tryCatchAsync(async () => {
      this.logger.debug({ email }, 'Finding user by email');
      return this.model.findUnique({ where: { email } });
    });
  }

  async findByIdWithSettings(id: string): Promise<Result<UserWithRelations | null, Error>> {
    return tryCatchAsync(async () => {
      return this.model.findUnique({
        where: { id },
        include: { settings: true },
      });
    });
  }

  async findByIdWithRelations(id: string): Promise<Result<UserWithRelations | null, Error>> {
    return tryCatchAsync(async () => {
      return this.model.findUnique({
        where: { id },
        include: {
          settings: true,
          favorites: true,
          familyMemberships: {
            include: { family: true },
          },
        },
      });
    });
  }

  async updateStripeCustomerId(
    userId: string,
    stripeCustomerId: string
  ): Promise<Result<User, Error>> {
    return tryCatchAsync(async () => {
      return this.model.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    });
  }

  async setPremiumStatus(
    userId: string,
    isPremium: boolean
  ): Promise<Result<User, Error>> {
    return tryCatchAsync(async () => {
      this.logger.info({ userId, isPremium }, 'Updating premium status');
      return this.model.update({
        where: { id: userId },
        data: { isPremium },
      });
    });
  }

  async getUserStats(userId: string): Promise<Result<{
    favorites: number;
    families: number;
    votes: number;
    suggestions: number;
  }, Error>> {
    return tryCatchAsync(async () => {
      const [favorites, families, votes, suggestions] = await Promise.all([
        prisma.favorite.count({ where: { userId } }),
        prisma.familyMember.count({ where: { userId } }),
        prisma.vote.count({ where: { userId } }),
        prisma.mealSuggestion.count({ where: { userId } }),
      ]);
      return { favorites, families, votes, suggestions };
    });
  }
}

export const userRepository = new UserRepository();
