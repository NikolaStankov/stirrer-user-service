import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private userRepository: UserRepository) {}

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);
      this.logger.log(`User successfully saved with ID: ${savedUser.id}`);

      return savedUser;
    } catch (error) {
      this.logger.error(
        `Error saving user in database: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByAuth0Id(auth0UserId: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { auth0UserId } });
  }

  async updateUser(
    auth0UserId: string,
    userData: Partial<User>,
  ): Promise<User> {
    await this.userRepository.update({ auth0UserId }, userData);
    return this.findByAuth0Id(auth0UserId);
  }
}
