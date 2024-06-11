import { Module } from '@nestjs/common';
import { Post } from './entity/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UserModule, S3Module],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
