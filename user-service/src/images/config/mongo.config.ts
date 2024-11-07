// src/config/mongo.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('mongo', () => ({
  uri: process.env.MONGO_URI,
}));
