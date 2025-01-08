import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { In } from 'typeorm';

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

  async getUsersByIds(userIds: string[]): Promise<User[]> {
    const numericIds = userIds.map((id) => Number(id));

    const validIds = numericIds.filter((id) => !isNaN(id));

    return this.userRepository.find({
      where: {
        id: In(validIds),
      },
    });
  }

  async updateUser(
    auth0UserId: string,
    userData: Partial<User>,
  ): Promise<User> {
    await this.userRepository.update({ auth0UserId }, userData);
    return this.findByAuth0Id(auth0UserId);
  }

  async getRandomUsersExcluding(excludedIds: string[]): Promise<User[]> {
    const numericExcludedIds = excludedIds
      .map((id) => Number(id))
      .filter((id) => !isNaN(id));

    const randomUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id NOT IN (:...excludedIds)', {
        excludedIds: numericExcludedIds.length ? numericExcludedIds : [-1],
      })
      .orderBy('RANDOM()') // Randomize the results
      .limit(10) // Limit to 10 users
      .getMany();

    return randomUsers;
  }

  async getRandomUsers(): Promise<User[]> {
    try {
      const randomUsers = await this.userRepository
        .createQueryBuilder('user')
        .orderBy('RANDOM()') // Randomize the results
        .limit(10) // Limit to 10 users
        .getMany();

      return randomUsers;
    } catch (error) {
      this.logger.error(
        `Error fetching random users: ${error.message}`,
        error.stack,
      );
      throw new Error('Unable to fetch random users.');
    }
  }
}
