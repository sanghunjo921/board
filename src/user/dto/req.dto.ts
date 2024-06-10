import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Role } from '../type/user.enum';

export class CreateUserReqDto {
  @MaxLength(20)
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,10}$/)
  password: string;

  @IsString()
  confirmPassword: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
