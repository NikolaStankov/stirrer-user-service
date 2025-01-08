import { Injectable, Logger } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { UserService } from 'src/users/services/user.service';
import { ImageService } from 'src/images/services/image.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    private readonly userService: UserService,
    private readonly imageService: ImageService,
  ) {}

  @RabbitRPC({
    exchange: 'tweets_exchange',
    routingKey: 'tweets.fetch_user_info',
    queue: 'tweets_user_info_fetch_queue',
    queueOptions: {
      durable: true,
    },
  })
  async handleFetchUserInfoRequest(payload: {
    userIds: string[];
  }): Promise<{ userId: string; displayName: string; image: string | null }[]> {
    try {
      this.logger.log(
        `Received request to fetch user info for: ${JSON.stringify(
          payload.userIds,
        )}`,
      );

      // Fetch all users by their IDs
      const users = await this.userService.getUsersByIds(payload.userIds);

      if (!users.length) {
        this.logger.warn('No users found for the given IDs.');
        return [];
      }

      // Fetch images for each user and format the response
      const userInfo = await Promise.all(
        users.map(async (user) => {
          const imageBase64 = user.imageId
            ? await this.fetchImageAsBase64(user.imageId)
            : null;

          return {
            userId: user.id.toString(),
            displayName: user.displayName,
            image: imageBase64, // The image as a base64 string
          };
        }),
      );

      return userInfo;
    } catch (error) {
      this.logger.error(
        `Error while fetching user info: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @RabbitRPC({
    exchange: 'tweets_exchange',
    routingKey: 'tweets.fetch_user_recommendation',
    queue: 'tweets_user_recommendation_fetch_queue',
    queueOptions: {
      durable: true,
    },
  })
  async handleFetchUserRecommendationInfoRequest(payload: {
    userIds: string[];
  }): Promise<{ userId: string; displayName: string; image: string | null }[]> {
    try {
      this.logger.log(
        `Received request to fetch user info for: ${JSON.stringify(
          payload.userIds,
        )}`,
      );

      let users: User[];

      if (payload.userIds && payload.userIds.length > 0) {
        users = await this.userService.getRandomUsersExcluding(payload.userIds);
      } else {
        users = await this.userService.getRandomUsers();
      }

      this.logger.log(`Random users's lenght: `, users.length);

      if (!users.length) {
        this.logger.warn('No users found for the given IDs.');
        return [];
      }

      // Fetch images for each user and format the response
      const userInfo = await Promise.all(
        users.map(async (user) => {
          const imageBase64 = user.imageId
            ? await this.fetchImageAsBase64(user.imageId)
            : null;

          return {
            userId: user.id.toString(),
            displayName: user.displayName,
            image: imageBase64, // The image as a base64 string
          };
        }),
      );

      return userInfo;
    } catch (error) {
      this.logger.error(
        `Error while fetching user info: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async fetchImageAsBase64(imageId: string): Promise<string | null> {
    try {
      const fileStream = await this.imageService.readStreamById(imageId);
      const chunks: Uint8Array[] = [];
      return new Promise((resolve, reject) => {
        fileStream.on('data', (chunk) => chunks.push(chunk));
        fileStream.on('end', () => {
          // Convert the buffer into a base64 string
          const buffer = Buffer.concat(chunks);
          const base64Image = buffer.toString('base64');
          resolve(base64Image);
        });
        fileStream.on('error', (err) => reject(err));
      });
    } catch (error) {
      this.logger.error(
        `Error fetching image for imageId ${imageId}: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
}
