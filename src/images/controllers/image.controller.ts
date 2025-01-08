import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from '../services/image.service';
import { Response } from 'express';
import { Logger } from '@nestjs/common';

@Controller('images')
export class ImageController {
  private readonly logger = new Logger(ImageController.name);

  constructor(private imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file, @Body('userId') userId: string) {
    this.logger.log(`Received request to upload image for userId: ${userId}`);

    const response = {
      originalname: file.originalname,
      mimetype: file.mimetype,
      id: file.id,
      filename: file.filename,
      metadata: file.metadata,
    };

    return response;
  }

  @Get('byid/:id')
  async getFileInfoById(@Param('id') id: string, @Res() res: Response) {
    const file = await this.imageService.findInfoById(id);
    const filestream = await this.imageService.readStreamById(id);
    if (!filestream) {
      throw new HttpException(
        'An error occurred while retrieving file info',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    res.header('Content-Type', file.contentType);
    return filestream.pipe(res);
  }
}
