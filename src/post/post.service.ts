import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entity/comment.entity';
import { S3Service } from 'src/s3/s3.service';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { FindOptionsWhere, MoreThan, Repository } from 'typeorm';
import {
  CreateAnnouncementDto,
  CreatePostReqDto,
  UpdatePostReqDto,
} from './dto/req.dto';
import { CreatePostResDto } from './dto/res.dto';
import { Post } from './entity/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
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
    const newPost = this.postRepository.create({
      subject,
      content,
      category,
      imagePath,
      user,
    });

    this.postRepository.save(newPost);

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

  async findPostById(id: number): Promise<Post> {
    try {
      const post = await this.postRepository.findOne({
        where: { id, isDeleted: 'N' },
        relations: ['comments', 'user'],
      });
      console.log(post.comments);

      return post;
    } catch (error) {
      throw error;
    }
  }

  async getPostsByDate(): Promise<Post[]> {
    const targetPosts = await this.postRepository.find({
      order: { createdAt: 'DESC' },
    });
    return targetPosts;
  }

  async getPostsByPopularity(
    dateRange: 'all' | 'year' | 'month' | 'week',
  ): Promise<Post[]> {
    let where: FindOptionsWhere<Post> = {};

    if (dateRange !== 'all') {
      const startDate = this.calculateStartDate(dateRange);
      where = {
        ...where,
        createdAt: MoreThan(startDate),
      };
    }

    const targetPosts = await this.postRepository.find({
      where,
      order: { clickCount: 'DESC' },
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

    if (targetUser) {
      where.user = targetUser;
    }

    targetPosts = await this.postRepository.find({
      where,
      relations: ['user'],
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
      await this.postRepository.save(targetPost);

      if (targetPost.comments && targetPost.comments.length > 0) {
        const commentIds = targetPost.comments.map((comment) => comment.id);
        // await this.commentService;
      }
      return targetPost;
    } catch (error) {
      throw error;
    }
  }

  private calculateStartDate(dateRange: 'year' | 'month' | 'week'): Date {
    const currentDate = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'year':
        startDate = new Date(
          currentDate.getFullYear() - 1,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
        break;
      case 'month':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          currentDate.getDate(),
        );
        break;
      case 'week':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 7,
        );
        break;
    }

    return startDate;
  }
}
