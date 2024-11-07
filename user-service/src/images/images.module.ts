import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageService } from './services/image.service';
import { ImageController } from './controllers/image.controller';
import { ImageMetadata, ImageMetadataSchema } from './schemas/image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ImageMetadata.name, schema: ImageMetadataSchema },
    ]),
  ],
  providers: [ImageService],
  controllers: [ImageController],
  exports: [ImageService],
})
export class ImageModule {}
