import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entity/comment.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateAnnouncementDto, CreatePostReqDto } from './dto/req.dto';
import { CreatePostResDto } from './dto/res.dto';
import { Post } from './entity/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly userService: UserService,
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

  async updateCommentByPost(postId: number, comment: Comment) {
    const post = await this.findPostById(postId);

    if (!post.comments) {
      post.comments = [];
    }
    post.comments.push(comment);

    await this.postRepository.save(post);
  }

  async findPostById(id: number): Promise<Post> {
    try {
      const post = await this.postRepository.findOne({
        where: { id },
        relations: ['comments'],
      });
      console.log(post.comments);

      return post;
    } catch (error) {
      throw error;
    }
  }
}
