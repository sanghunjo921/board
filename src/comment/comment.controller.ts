import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { AuthUser, AuthUserType } from 'src/auth/decorator/auth-user.decorator';
import { CommentService } from './comment.service';
import { CreateCommentReqDto, UpdateCommentDto } from './dto/req.dto';
import { CreateCommentResDto } from './dto/res.dto';
import { Comment } from './entity/comment.entity';

@Controller('post/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body()
    createCommentReqDto: CreateCommentReqDto,
    @AuthUser() user: AuthUserType,
  ): Promise<CreateCommentResDto> {
    if (user.id) {
      createCommentReqDto.userId = user.id;
    }

    createCommentReqDto.postId = postId;

    return this.commentService.createComment(createCommentReqDto);
  }

  @Get()
  getAllCommentsByPost(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Comment[]> {
    return this.commentService.getAllCommentsByPost(postId);
  }

  @Get(':id')
  getCommentByPost(
    @Param('id', ParseIntPipe) id: number,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Comment> {
    return this.commentService.getCommentByPost(id, postId);
  }

  @Patch(':id')
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostReqDto: UpdateCommentDto,
  ): Promise<Comment> {
    return this.commentService.updateComment(id, updatePostReqDto);
  }

  @Put(':id')
  deletePost(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return this.commentService.deleteComment(id);
  }
}
