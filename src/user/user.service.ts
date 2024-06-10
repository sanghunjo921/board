import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserReqDto } from './dto/req.dto';
import { CreateUserResDto } from './dto/res.dto';
import { User } from './entity/user.entity';
import { Role } from './type/user.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser({
    email,
    password,
    confirmPassword,
    role,
  }: CreateUserReqDto): Promise<CreateUserResDto> {
    try {
      const isExist = await this.userRepository.findOne({ where: { email } });

      if (isExist) {
        throw new Error('User already exist');
      }

      if (password !== confirmPassword) {
        throw new Error('Password does not match');
      }

      const newUser = this.userRepository.create({ email, password, role });

      await this.userRepository.save(newUser);

      return {
        id: newUser.id,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      };
    } catch (error) {
      throw new Error('Error occured while creating a user');
    }
  }
}
