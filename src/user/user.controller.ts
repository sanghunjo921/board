import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserReqDto } from './dto/req.dto';
import { CreateUserResDto } from './dto/res.dto';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(
    @Body()
    createUserReqDto: CreateUserReqDto,
  ): Promise<CreateUserResDto> {
    return this.userService.createUser(createUserReqDto);
  }
}
