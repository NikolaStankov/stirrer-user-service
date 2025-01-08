import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './users/entities/user.entity';
import { UserModule } from './users/user.module';
import { ImageModule } from './images/images.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('USER_DB_HOST'),
        port: +configService.get('USER_DB_PORT'),
        username: configService.get('USER_DB_USERNAME'),
        password: configService.get('USER_DB_PASSWORD'),
        database: configService.get('USER_DB_NAME'),
        entities: [User],
        synchronize: true, //Set to false in production
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI_IMG),
    UserModule,
    ImageModule,
    RabbitMQModule,
  ],
})
export class AppModule {}
