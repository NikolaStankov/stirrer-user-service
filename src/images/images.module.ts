import { Module } from '@nestjs/common';
import { ImageService } from './services/image.service';
import { ImageController } from './controllers/image.controller';
import { MulterModule } from '@nestjs/platform-express';
import { GridFSMulterConfigService } from './config/grifs-multer.config.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: GridFSMulterConfigService,
    }),
  ],
  providers: [ImageService, GridFSMulterConfigService],
  controllers: [ImageController],
  exports: [ImageService],
})
export class ImageModule {}
