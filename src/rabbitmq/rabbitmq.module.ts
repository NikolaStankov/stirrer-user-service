import { Module } from '@nestjs/common';
import { RabbitMQModule as NestRabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQService } from './rabbitmq.service';
import { UserModule } from 'src/users/user.module';
import { ImageModule } from 'src/images/images.module';

@Module({
  imports: [
    UserModule,
    ImageModule,
    NestRabbitMQModule.forRootAsync(NestRabbitMQModule, {
      useFactory: () => ({
        uri: process.env.RABBITMQ_URL,
        exchanges: [
          {
            name: process.env.RABBITMQ_EXCHANGE,
            type: 'topic',
          },
        ],
      }),
    }),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
