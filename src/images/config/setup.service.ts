// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { InjectConnection } from '@nestjs/mongoose';
// import { Connection } from 'mongoose';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class SetupService implements OnModuleInit {
//   private readonly logger = new Logger(SetupService.name);

//   constructor(
//     @InjectConnection() private readonly mongoConnection: Connection,
//     private readonly configService: ConfigService, // Inject ConfigService
//   ) {}

//   async onModuleInit() {
//     await this.createUser();
//   }

//   private async createUser() {
//     const db = this.mongoConnection.db;

//     // Check if the user already exists using usersInfo
//     const userInfo = await db.command({
//       usersInfo: 'nikola01mongo', // Check for the user
//     });

//     // If usersInfo returns an empty array, the user does not exist
//     if (!userInfo.users || userInfo.users.length === 0) {
//       // Create a new user with read/write access
//       this.logger.log(
//         `Creating mongo user nikola01mongo with password ${this.configService.get<string>('MONGO_PASSWORD')}`,
//       );
//       await db.command({
//         createUser: 'nikola01mongo',
//         pwd: this.configService.get<string>('MONGO_PASSWORD'),
//         roles: [{ role: 'readWrite', db: 'profile_images' }],
//       });
//       this.logger.log('User created successfully');
//     } else {
//       this.logger.log('User already exists');
//     }
//   }
// }
