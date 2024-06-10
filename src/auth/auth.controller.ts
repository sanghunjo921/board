import { AuthService } from './auth.service';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Get,
  Headers,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SigninReqDto, SignupReqDto } from './dto/req.dto';
import { SigninResDto, SignupResDto } from './dto/res.dto';
import { Request, Response } from 'express';
import { Role } from 'src/user/type/user.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body()
    { email, password, confirmPassword, role = Role.REGULAR }: SignupReqDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<SignupResDto> {
    if (password !== confirmPassword) {
      throw new BadRequestException('Password does not match');
    }

    return this.authService.signup(email, password, role, res, req);
  }

  @Post('signin')
  async signin(
    @Body() { email, password }: SigninReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SigninResDto> {
    return this.authService.signIn(email, password, res);
  }
}
