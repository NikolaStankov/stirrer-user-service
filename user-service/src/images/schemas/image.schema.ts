// src/schemas/image.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageMetadataDocument = ImageMetadata & Document;

@Schema()
export class ImageMetadata {
  @Prop({ required: true })
  userId: string; // The ID of the user this image belongs to

  @Prop({ required: true })
  filename: string; // The original filename of the uploaded image

  @Prop({ required: true })
  contentType: string; // The MIME type of the image (e.g., 'image/jpeg')

  @Prop({ required: true })
  size: number; // The size of the image file in bytes

  @Prop({ required: true })
  uploadDate: Date; // The date when the image was uploaded
}

export const ImageMetadataSchema = SchemaFactory.createForClass(ImageMetadata);
