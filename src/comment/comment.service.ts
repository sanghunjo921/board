import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostService } from 'src/post/post.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateCommentReqDto, UpdateCommentDto } from './dto/req.dto';
import { CreateCommentResDto } from './dto/res.dto';
import { Comment } from './entity/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => PostService))
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

  async getAllCommentsByPost(postId: number): Promise<Comment[]> {
    const targetPost = await this.postService.findOne(postId);

    const comments = targetPost.comments;

    comments.sort((commentA, commentB) => {
      return (
        commentA.parent - commentB.parent ||
        commentA.createdAt.getTime() - commentB.createdAt.getTime()
      );
    });

    return comments;
  }

  async getCommentByPost(id: number, postId: number): Promise<Comment> {
    try {
      const targetPost = await this.postService.findPostById(postId);

      if (!targetPost) {
        throw new Error('Post not found or already deleted');
      }

      const targetComment = targetPost.comments.find(
        (comment) => comment.id === id && comment.isDeleted === 'N',
      );

      if (!targetComment) {
        throw new Error('Comment not found or already deleted');
      }

      return targetComment;
    } catch (error) {
      throw error;
    }
  }

  async updateComment(
    id: number,
    updateDate: UpdateCommentDto,
  ): Promise<Comment> {
    try {
      const targetComment = await this.commentRepository.findOne({
        where: { id },
      });

      const { affected } = await this.commentRepository.update(id, updateDate);

      if (affected === 0) {
        throw new HttpException('Comment not found', HttpStatus.BAD_REQUEST);
      }

      return { ...targetComment, ...updateDate };
    } catch (error) {
      throw error;
    }
  }

  async deleteCommentsByPostId(postid: number): Promise<any> {
    try {
      const targetPost = await this.postService.findPostById(postid);

      console.log({ targetPost });

      return this.commentRepository.update(
        {
          post: targetPost,
        },
        {
          isDeleted: 'Y',
        },
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(id: number): Promise<Comment> {
    try {
      const targetComment = await this.commentRepository.findOne({
        where: { id },
      });
      if (!targetComment) {
        throw new Error('Comment not found or already deleted');
      }
      targetComment.isDeleted = 'Y';
      await this.commentRepository.save(targetComment);

      return targetComment;
    } catch (error) {
      throw error;
    }
  }
}
