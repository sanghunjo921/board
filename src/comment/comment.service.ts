import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entity/post.entity';
import { PostService } from 'src/post/post.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateCommentReqDto } from './dto/req.dto';
import { CreateCommentResDto } from './dto/res.dto';
import { Comment } from './entity/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  async createComment({
    content,
    level,
    parent,
    userId,
    postId,
  }: CreateCommentReqDto): Promise<CreateCommentResDto> {
    const user = await this.userService.findUserById(userId);
    const post = await this.postService.findPostById(postId);

    const newComment = this.commentRepository.create({
      content,
      level,
      parent,
      user,
      post,
    });

    await this.commentRepository.save(newComment);
    await this.postService.updateCommentByPost(postId, newComment);

    return newComment;
  }
}
