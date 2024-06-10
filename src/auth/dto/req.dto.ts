import {
  IsEmail,
  IsEnum,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { Role } from 'src/user/type/user.enum';

export class SigninReqDto {
  @MaxLength(20)
  @IsEmail()
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,10}$/)
  password: string;
}

export class SignupReqDto extends SigninReqDto {
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,10}$/)
  confirmPassword: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
