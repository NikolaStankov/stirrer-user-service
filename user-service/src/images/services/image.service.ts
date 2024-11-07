import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { ImageMetadata } from '../schemas/image.schema';
import { Model } from 'mongoose';

@Injectable()
export class ImageService {
  private bucket: GridFSBucket;

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    @InjectModel(ImageMetadata.name)
    private readonly imageMetadataModel: Model<ImageMetadata>,
  ) {
    this.bucket = new GridFSBucket(this.mongoConnection.db as any);
  }

  async storeImage(file: Express.Multer.File, userId: string): Promise<string> {
    const uploadStream = this.bucket.openUploadStream(file.originalname, {
      metadata: { userId },
    });

    await new Promise((resolve, reject) => {
      uploadStream.end(file.buffer, (error) => {
        if (error) reject(error);
        else resolve(uploadStream.id);
      });
    });

    // Save metadata to a separate collection
    const imageMetadata = new this.imageMetadataModel({
      userId,
      filename: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      uploadDate: new Date(),
    });

    await imageMetadata.save(); // Save metadata

    return uploadStream.id.toString(); // Return the ID of the uploaded image
  }

  async getImageByUserId(userId: string): Promise<Buffer> {
    const files = await this.bucket
      .find({ 'metadata.userId': userId })
      .toArray();
    if (files.length === 0) {
      throw new NotFoundException('No image found for this user');
    }
    const latestFile = files[files.length - 1]; // Get the most recent image
    const downloadStream = this.bucket.openDownloadStream(latestFile._id);

    return new Promise((resolve, reject) => {
      const chunks = [];
      downloadStream.on('data', (chunk) => chunks.push(chunk));
      downloadStream.on('error', reject);
      downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
