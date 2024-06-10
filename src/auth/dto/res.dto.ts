import { IsNumber, IsString } from 'class-validator';
import { RefreshToken } from '../entity/refreshToken.entity';

export class SignupResDto {
  @IsNumber()
  userId: number;

  @IsString()
  access: string;

  @IsString()
  refresh: RefreshToken;
}

export class SigninResDto extends SignupResDto {}

export class RefreshResDto extends SignupResDto {}
