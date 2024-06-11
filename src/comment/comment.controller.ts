import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AuthUser, AuthUserType } from 'src/auth/decorator/auth-user.decorator';
import { CommentService } from './comment.service';
import { CreateCommentReqDto } from './dto/req.dto';
import { CreateCommentResDto } from './dto/res.dto';

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
}
