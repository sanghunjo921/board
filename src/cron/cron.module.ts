import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entity/post.entity';
import { ViewCounts } from 'src/post/entity/view.entity';
import { CronService } from './cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, ViewCounts])],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
