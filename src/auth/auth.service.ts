import { BadRequestException, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { DataSource, Repository } from 'typeorm';
import { SigninResDto, SignupResDto } from './dto/res.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { RefreshToken } from './entity/refreshToken.entity';
import { Role } from 'src/user/type/user.enum';
import { TokenType } from './type/auth.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async signup(
    email: string,
    password: string,
    role: Role,
    res: Response,
    req: Request,
  ): Promise<SignupResDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;

    try {
      const newUser = queryRunner.manager.create(User, {
        email,
        password,
        role,
      });
      await queryRunner.manager.save(newUser);

      const access = this.generateToken(newUser.id, TokenType.ACCESS);
      const refresh = this.generateToken(newUser.id, TokenType.REFRESH);

      const refreshToken = queryRunner.manager.create(RefreshToken, {
        token: refresh,
        user: { id: newUser.id },
      });

      await queryRunner.manager.save(refreshToken);

      await queryRunner.commitTransaction();

      return {
        userId: newUser.id,
        access,
        refresh: refreshToken,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      error = err;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  async signIn(
    email: string,
    password: string,
    res: Response,
  ): Promise<SigninResDto> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    if (password !== user.password) {
      throw new BadRequestException('Password does not match');
    }

    const refresh = await this.createOrUpdateRefreshToken(
      user.id,
      this.generateToken(user.id, TokenType.REFRESH),
    );

    const access = this.generateToken(user.id, TokenType.ACCESS);

    return {
      userId: user.id,
      access,
      refresh,
    };
  }

  async refreshToken(userId: number, token: string, res: Response) {
    try {
      const refresh = await this.refreshTokenRepository.findOneBy({ token });

      if (!refresh) {
        throw new BadRequestException('Invalid refresh token');
      }

      const newRefresh = await this.createOrUpdateRefreshToken(
        userId,
        this.generateToken(userId, TokenType.REFRESH),
      );
      const access = this.generateToken(userId, TokenType.ACCESS);

      return {
        userId,
        access,
        refresh,
      };
    } catch (error) {
      throw error;
    }
  }

  private generateToken(userId: number, tokenType: TokenType): string {
    const payload = {
      sub: userId,
      type: tokenType.toString(),
    };

    return tokenType === TokenType.REFRESH
      ? this.jwtService.sign(payload, { expiresIn: '30d' })
      : this.jwtService.sign(payload);
  }

  private async createOrUpdateRefreshToken(
    userId: number,
    token: string,
  ): Promise<RefreshToken> {
    let refreshToken = await this.refreshTokenRepository.findOneBy({
      user: { id: userId },
    });

    if (refreshToken) {
      refreshToken.token = token;
    } else {
      refreshToken = this.refreshTokenRepository.create({
        token,
        user: { id: userId },
      });
    }
    return this.refreshTokenRepository.save(refreshToken);
  }
}
