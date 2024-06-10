import { Role } from '../type/user.enum';

export class CreateUserResDto {
  id: number;

  email: string;

  password: string;

  role: Role;
}
