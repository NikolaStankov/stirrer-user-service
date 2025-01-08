import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { Connection } from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage/lib/gridfs';

@Injectable()
export class GridFSMulterConfigService implements MulterOptionsFactory {
  private gridFsStorage: GridFsStorage;

  constructor(
    private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    if (!this.connection.readyState) {
      throw new Error('MongoDB connection not open');
    }

    this.gridFsStorage = new GridFsStorage({
      url: this.configService.get('MONGO_URI_IMG'),
      file: (req, file) => {
        return new Promise((resolve, reject) => {
          const filename = file.originalname.trim();
          const fileInfo = {
            filename: filename,
            metadata: { userId: req.body.userId },
          };
          resolve(fileInfo);
        });
      },
    });
  }

  createMulterOptions(): Promise<MulterModuleOptions> | MulterModuleOptions {
    return {
      storage: this.gridFsStorage,
    };
  }
}
