/**
 * Auth Service - Business Logic for Authentication
 */

import bcrypt from 'bcryptjs';
import { BaseService, ServiceErrors, ServiceError } from './base.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { Result, success, failure, isSuccess, isFailure } from '../utils/result.js';
import { logAudit } from '../lib/logger.js';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    isPremium: boolean;
  };
}

export class AuthService extends BaseService {
  constructor() {
    super('AuthService');
  }

  async register(input: RegisterInput): Promise<Result<AuthResult, ServiceError>> {
    return this.executeWithLogging('register', async () => {
      const { email, password, name } = input;

      // Validate input
      if (!email || !password || !name) {
        return failure(ServiceErrors.VALIDATION('Email, password, and name are required'));
      }

      if (password.length < 6) {
        return failure(ServiceErrors.VALIDATION('Password must be at least 6 characters'));
      }

      // Check if user exists
      const existingUser = await userRepository.findByEmail(email);
      if (isSuccess(existingUser) && existingUser.value) {
        return failure(ServiceErrors.CONFLICT('Email already registered'));
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const createResult = await userRepository.create({
        email,
        password: hashedPassword,
        name,
      });

      if (isFailure(createResult)) {
        return failure(ServiceErrors.INTERNAL('Failed to create user'));
      }

      const user = createResult.value;
      logAudit('USER_REGISTERED', user.id, { email });

      return success({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isPremium: user.isPremium,
        },
      });
    });
  }

  async login(input: LoginInput): Promise<Result<AuthResult, ServiceError>> {
    return this.executeWithLogging('login', async () => {
      const { email, password } = input;

      // Validate input
      if (!email || !password) {
        return failure(ServiceErrors.VALIDATION('Email and password are required'));
      }

      // Find user
      const userResult = await userRepository.findByEmail(email);
      if (isFailure(userResult)) {
        return failure(ServiceErrors.INTERNAL('Database error'));
      }

      const user = userResult.value;
      if (!user) {
        return failure(ServiceErrors.VALIDATION('Invalid email or password'));
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        logAudit('LOGIN_FAILED', user.id, { email, reason: 'invalid_password' });
        return failure(ServiceErrors.VALIDATION('Invalid email or password'));
      }

      logAudit('USER_LOGGED_IN', user.id, { email });

      return success({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isPremium: user.isPremium,
        },
      });
    });
  }

  async validateToken(userId: string): Promise<Result<AuthResult, ServiceError>> {
    const userResult = await userRepository.findById(userId);
    
    if (isFailure(userResult)) {
      return failure(ServiceErrors.INTERNAL('Database error'));
    }

    const user = userResult.value;
    if (!user) {
      return failure(ServiceErrors.UNAUTHORIZED());
    }

    return success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
      },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<Result<void, ServiceError>> {
    return this.executeWithLogging('changePassword', async () => {
      const userResult = await userRepository.findById(userId);
      
      if (isFailure(userResult) || !userResult.value) {
        return failure(ServiceErrors.NOT_FOUND('User'));
      }

      const user = userResult.value;
      const isValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValid) {
        return failure(ServiceErrors.VALIDATION('Current password is incorrect'));
      }

      if (newPassword.length < 6) {
        return failure(ServiceErrors.VALIDATION('Password must be at least 6 characters'));
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userRepository.update(userId, { password: hashedPassword });
      
      logAudit('PASSWORD_CHANGED', userId, {});
      return success(undefined);
    });
  }
}

export const authService = new AuthService();
