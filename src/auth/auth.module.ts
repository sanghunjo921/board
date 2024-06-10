import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entity/refreshToken.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
