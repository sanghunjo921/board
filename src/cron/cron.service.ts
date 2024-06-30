import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import * as cron from 'node-cron';
import { Post } from 'src/post/entity/post.entity';
import { ViewCounts } from 'src/post/entity/view.entity';
import { caculateTimeDifference } from 'src/utils/util';
import { Repository } from 'typeorm';

@Injectable()
export class CronService {
  constructor(
    @InjectRedis() private readonly redisService: Redis,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(ViewCounts)
    private readonly viewRepo: Repository<ViewCounts>,
  ) {}

  //   batchInterval: string = '0 0 * * *';
  batchInterval: string = '* * * * *';

  initiateCron = async () => {
    cron.schedule(this.batchInterval, async () => {
      try {
        console.log('started cron');

        const postIds = (await this.postRepo.find()).map((post) => post.id);

        postIds.forEach(async (id) => {
          const yrKey = `post:${id}:yr`;
          const monthKey = `post:${id}:month`;
          const weekKey = `post:${id}:week`;

          const viewCounts = await this.viewRepo.findOne({
            where: {
              post: {
                id,
              },
            },
          });

          if (!viewCounts) {
            return;
          }

          const [yr, month, week] = await this.redisService
            .mget(yrKey, monthKey, weekKey)
            .then((results) =>
              results.map((item) => (item ? Number(item) : 0)),
            );

          viewCounts.clickCount = 0;

          const diffDay = caculateTimeDifference(
            new Date(viewCounts?.updatedClickCountDate),
          );

          if (diffDay > 7) {
            if (yr > 0) {
              await this.redisService.set(yrKey, 0);
            }
            if (month > 0) {
              await this.redisService.set(monthKey, 0);
            }

            if (week > 0) {
              await this.redisService.set(weekKey, 0);
            }
          } else if (diffDay > 30) {
            if (month > 0) {
              await this.redisService.set(monthKey, 0);
            }
            if (yr > 0) {
              await this.redisService.set(yrKey, 0);
            }
          } else if (diffDay > 365) {
            if (yr > 0) {
              await this.redisService.set(yrKey, 0);
            }
          }
        });
      } catch (error) {
        throw new Error('Error during cron execution');
      }
    });
  };
}
