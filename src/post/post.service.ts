import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/entity/comment.entity';
import { S3Service } from 'src/s3/s3.service';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  CreateAnnouncementDto,
  CreatePostReqDto,
  UpdatePostReqDto,
} from './dto/req.dto';
import { CreatePostResDto } from './dto/res.dto';
import { Post } from './entity/post.entity';
import { ViewCounts } from './entity/view.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    @Inject(forwardRef(() => CommentService))
    private readonly commentService: CommentService,
    @InjectRepository(ViewCounts)
    private readonly viewRepository: Repository<ViewCounts>,
    @InjectRedis()
    private readonly redisService: Redis,
  ) {}

  async createPost({
    subject,
    content,
    category,
    imagePath,
    userId,
  }: CreatePostReqDto | CreateAnnouncementDto): Promise<CreatePostResDto> {
    console.log({ userId });
    const user = await this.userService.findUserById(Number(userId));
    const view = this.viewRepository.create();
    await this.viewRepository.save(view);
    const newPost = this.postRepository.create({
      subject,
      content,
      category,
      imagePath,
      user,
      viewCount: view,
    });
    const postId = newPost.id;
    const yrKey = `post:${postId}:yr`;
    const monthKey = `post:${postId}:month`;
    const weekKey = `post:${postId}:week`;

    await this.redisService.mset(yrKey, 0, monthKey, 0, weekKey, 0);

    await this.postRepository.save(newPost);

    return newPost;
  }

  async uploadImage(image: Express.Multer.File, id: number) {
    const targetPost = await this.findPostById(id);

    const ext = image.originalname.split('.').pop();

    const imageUrl = await this.s3Service.uploadImageToS3(
      `${id}.${ext}`,
      image,
      ext,
    );

    targetPost.imagePath = imageUrl;

    await this.postRepository.save(targetPost);

    return { imageUrl };
  }

  async updateCommentByPost(postId: number, comment: Comment) {
    const post = await this.findPostById(postId);

    if (!post.comments) {
      post.comments = [];
    }
    post.comments.push(comment);

    await this.postRepository.save(post);
  }

  async findAllPosts(): Promise<Post[]> {
    try {
      return this.postRepository.find({ where: { isDeleted: 'N' } });
    } catch (error) {
      throw new Error('error while getting all posts');
    }
  }

  async findOne(id: number) {
    await this.postRepository.increment({ id }, 'clickCount', 1);

    const ticket = await this.postRepository.findOneBy({ id });

    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth();
    // monday 기준
    const week = caculateTimeDifference();
    const day = today.getDay();

    const yrKey = `ticket:${id}:yr:${year}`;
    const monthKey = `ticket:${id}:month:${month}`;
    const weekKey = `ticket:${id}:week:${week}`;
    const dayKey = `ticket:${id}:week:${day}`;

    let [yrCounts, monthCounts, weekCounts, dayCounts] = (
      await this.redisService.mget(yrKey, monthKey, weekKey, dayKey)
    ).map((item) => +item);

    yrCounts = yrCounts ? yrCounts + 1 : 1;
    monthCounts = monthCounts ? monthCounts + 1 : 1;
    weekCounts = weekCounts ? weekCounts + 1 : 1;
    dayCounts = dayCounts ? dayCounts + 1 : 1;

    await this.redisService.mset(
      yrKey,
      yrCounts,
      monthKey,
      monthCounts,
      weekKey,
      weekCounts,
      dayKey,
      dayCounts,
    );

    return ticket;
  }

  async findPostById(id: number): Promise<Post> {
    return await this.postRepository.manager.transaction(
      async (transactionalEntityManager) => {
        try {
          const post = await transactionalEntityManager.findOne(Post, {
            where: { id, isDeleted: 'N' },
            relations: ['comments', 'user', 'viewCount'],
          });

          if (!post) {
            throw new Error(`Post with id ${id} not found`);
          }

          await transactionalEntityManager.query(
            `
          UPDATE view_counts
          SET click_count = click_count + 1, updated_click_count_date = ?
          WHERE post_id = ?
        `,
            [new Date(), post.id],
          );

          this.updateViewCountsOnRedis(id);

          await transactionalEntityManager.save(Post, post);

          return post;
        } catch (err) {
          throw new Error(`failed to find post with id ${id}: ${err.message}`);
        }
      },
    );
  }

  async updateViewCountsOnRedis(postId: number) {
    const yrKey = `post:${postId}:yr`;
    const monthKey = `post:${postId}:month`;
    const weekKey = `post:${postId}:week`;
    const [yr, month, week] = await this.redisService
      .mget(yrKey, monthKey, weekKey)
      .then((results) => results.map((item) => (item ? Number(item) : 0)));

    await this.redisService.mset(
      yrKey,
      yr + 1,
      monthKey,
      month + 1,
      weekKey,
      week + 1,
    );
  }

  async getPostsyearlyPopularity(postId: number): Promise<Post[]> {
    const postIds = (await this.postRepository.find()).map((post) => post.id);

    const posts: { post: Post; viewCount: number }[] = [];

    for (const id of postIds) {
      const yrKey = `post:${id}:yr`;
      const viewCount = await this.redisService.get(yrKey);

      const post = await this.postRepository.findOne({ where: { id } });

      posts.push({ post, viewCount: parseInt(viewCount, 10) });
    }

    posts.sort((a, b) => b.viewCount - a.viewCount);

    return posts.map((p) => p.post);
  }
  async getPostsweeklyPopularity(): Promise<Post[]> {
    const postIds = (await this.postRepository.find()).map((post) => post.id);

    const posts: { post: Post; viewCount: number }[] = [];

    for (const id of postIds) {
      const yrKey = `post:${id}:week`;
      const viewCount = await this.redisService.get(yrKey);

      const post = await this.postRepository.findOne({ where: { id } });

      posts.push({ post, viewCount: parseInt(viewCount, 10) });
    }

    posts.sort((a, b) => b.viewCount - a.viewCount);

    return posts.map((p) => p.post);
  }
  async getPostsmonthyPopularity(): Promise<Post[]> {
    const postIds = (await this.postRepository.find()).map((post) => post.id);

    const posts: { post: Post; viewCount: number }[] = [];

    for (const id of postIds) {
      const yrKey = `post:${id}:month`;
      const viewCount = await this.redisService.get(yrKey);

      const post = await this.postRepository.findOne({ where: { id } });

      posts.push({ post, viewCount: parseInt(viewCount, 10) });
    }

    posts.sort((a, b) => b.viewCount - a.viewCount);

    return posts.map((p) => p.post);
  }

  async findDailyPopularTickets() {
    const tickets = await this.postRepository.find();

    const caching: { [key: number]: number } = {};

    const promises = tickets.map(async (ticket) => {
      const today = new Date();
      const day = today.getDay();
      const dayKey = `ticket:${ticket.id}:yr:${day}`;

      const dayCountsStr = await this.redisService.get(dayKey);
      let dayCounts: number = 0;
      if (dayCountsStr) {
        dayCounts = JSON.parse(dayCountsStr);
      }

      caching[ticket.id] = dayCounts;
    });

    await Promise.all(promises);

    const sortedTickets = Object.entries(caching).sort((a, b) => b[1] - a[1]);

    const sortedTicketPromises = sortedTickets.map(async ([idStr]) => {
      const id = Number(idStr);
      return await this.postRepository.findOne({ where: { id } });
    });

    const sortedTicketObjects = await Promise.all(sortedTicketPromises);

    return sortedTicketObjects;
  }

  async getPostsByDate(): Promise<Post[]> {
    const targetPosts = await this.postRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return targetPosts;
  }

  async filterPosts(subject?: string, email?: string): Promise<Post[]> {
    let targetPosts: Post[];
    let targetUser: User | undefined;

    if (email) {
      targetUser = await this.userService.findUserByEmail(email);
    }

    const where: FindOptionsWhere<Post> = {};

    if (subject) {
      where.subject = subject;
    }

    targetPosts = await this.postRepository.find({
      where,
      relations: ['user'],
    });

    targetPosts = targetPosts.filter((post) => {
      return targetUser ? post.user.id === targetUser.id : true;
    });

    return targetPosts;
  }

  async updatePost(id: number, newData: UpdatePostReqDto): Promise<Post> {
    try {
      const targetPost = await this.findPostById(id);
      const { affected } = await this.postRepository.update(id, newData);

      if (affected === 0) {
        throw new HttpException('Ticket not found', HttpStatus.BAD_REQUEST);
      }
      return { ...targetPost, ...newData };
    } catch (error) {
      throw error;
    }
  }

  async deletePost(id: number): Promise<Post> {
    try {
      const targetPost = await this.findPostById(id);
      if (!targetPost) {
        throw new Error('Post not found or already deleted');
      }
      targetPost.isDeleted = 'Y';

      const result = await this.commentService.deleteCommentsByPostId(id);
      console.log({ result });

      await this.postRepository.save(targetPost);

      return targetPost;
    } catch (error) {
      throw error;
    }
  }
}

export const caculateTimeDifference = () => {
  const today = new Date();

  // 올해의 첫 날 (1월 1일)
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // 밀리초 단위의 차이 계산
  const diffTime = today.getTime() - startOfYear.getTime();

  // 밀리초를 일 단위로 변환
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // 몇 번째 주인지 계산
  const weekNumber = Math.ceil((diffDays + startOfYear.getDay() + 1) / 7);

  return weekNumber;
};
