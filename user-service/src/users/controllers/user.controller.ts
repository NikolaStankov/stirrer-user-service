import { Body, Controller, Get, Logger, Post, Req } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create.user.dto';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Req() req, @Body() createUserDto: CreateUserDto) {
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

  @Get()
  async getProfileStatus(@Body('auth0UserId') auth0UserId: string) {
    const user = await this.userService.findByAuth0Id(auth0UserId);
    return { profileCompleted: user ? user.profileCompleted : false };
  }
}
