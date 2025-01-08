import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoGridFS } from 'mongo-gridfs';
import { ImageInfoDto } from '../dto/image-info.dto';
import { GridFSBucketReadStream } from 'mongodb';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private fileModel: MongoGridFS;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.fileModel = new MongoGridFS(this.connection.db, 'fs');
  }

  async readStream(id: string): Promise<GridFSBucketReadStream> {
    return await this.fileModel.readFileStream(id);
  }

  async findInfoByUserId(userId: string): Promise<ImageInfoDto> {
    const result = await this.fileModel
      .findOne({ 'metadata.userId': userId })
      .catch((err) => {
        this.logger.error(
          `Error finding file for userId ${userId}: ${err.message}`,
        );
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      });

    this.logger.log(
      `Result from findOne method for userId(${userId}) is: ${result._id}, ${result.filename}, ${result.contentType}`,
    );

    if (!result || result.length === 0) {
      throw new HttpException(
        'File not found for this user',
        HttpStatus.NOT_FOUND,
      );
    }

    // Assuming we want the most recent file if multiple exist
    const latestFile = result[result.length - 1];
    this.logger.log(`Latest file is: ${latestFile}`)

    return {
      id: latestFile._id.toString(),
      userId: userId,
      filename: latestFile.filename,
      contentType: latestFile.contentType,
    };
  }

  async findInfoById(id: string): Promise<ImageInfoDto> {
    const result = await this.fileModel
      .findById(id)
      .catch((err) => {
        throw new HttpException('File not found for the provided ID', HttpStatus.NOT_FOUND);
      });

    if (!result) {
      throw new HttpException('File not found for the provided ID', HttpStatus.NOT_FOUND);
    }

    return {
      id: result._id.toString(),
      filename: result.filename,
      contentType: result.contentType,
    };
  }

  // Fetch file stream based on image ID
  async readStreamById(id: string): Promise<GridFSBucketReadStream> {
    const file = await this.fileModel.findById(id);
    if (!file) {
      throw new HttpException('File not found for the provided ID', HttpStatus.NOT_FOUND);
    }

    return this.fileModel.readFileStream(file._id.toString());
  }
}
