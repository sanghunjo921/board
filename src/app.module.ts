import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import dbConfig from './config/mysql.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      cache: true,
      load: [dbConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let typeOrmModuleOptions: TypeOrmModuleOptions = {
          type: configService.get('db.type'),
          host: configService.get('db.host'),
          port: configService.get('db.port'),
          database: configService.get('db.dbName'),
          username: configService.get('db.username'),
          password: configService.get('db.password'),
          autoLoadEntities: true,
        } as any;
        typeOrmModuleOptions = Object.assign(typeOrmModuleOptions, {
          synchronize: true,
          logging: true,
        });
        return typeOrmModuleOptions;
      },
    }),
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
  ],
})
export class AppModule {}
