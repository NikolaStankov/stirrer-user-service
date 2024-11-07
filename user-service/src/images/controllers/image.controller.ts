import {
  Controller,
  Post,
  Get,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from '../services/image.service';
import { Response } from 'express';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string, // Expecting userId in the body
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    const imageId = await this.imageService.storeImage(file, userId);
    return { imageId }; // Return the ID of the uploaded image
  }

  @Get('user/:userId') // Endpoint to get the latest image by user ID
  async getImageByUserId(
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const image = await this.imageService.getImageByUserId(userId);
    res.contentType('image/jpeg'); // Adjust content type as needed
    res.send(image); // Send the image data as a response
  }
}
