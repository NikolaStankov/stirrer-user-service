import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create.user.dto';
import { GatewayGuard } from 'src/guards/gateway.guard';

@Controller('users')
@UseGuards(GatewayGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Req() req, @Body() createUserDto: CreateUserDto) {
    this.logger.log('Received createUserDto: ', createUserDto);
    const { auth0UserId, ...userData } = createUserDto;
    const user = await this.userService.findByAuth0Id(auth0UserId);

    if (user) {
      return this.userService.updateUser(auth0UserId, {
        ...userData,
        profileCompleted: true,
      });
    }

    return this.userService.createUser({
      ...createUserDto,
      profileCompleted: true,
    });
  }

  @Get(':auth0Id')
  async getUserByAuth0Id(@Param('auth0Id') auth0Id: string) {
    return await this.userService.findByAuth0Id(auth0Id);
  }

  @Get(':auth0UserId/profile-status')
  async getProfileStatus(@Param('auth0UserId') auth0UserId: string) {
    const user = await this.userService.findByAuth0Id(auth0UserId);
    return { profileCompleted: user ? user.profileCompleted : false };
  }
}
