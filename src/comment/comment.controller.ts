import { Body, Controller, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentReqDto } from './dto/req.dto';
import { CreateCommentResDto } from './dto/res.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  createComment(
    @Body()
    createUserReqDto: CreateCommentReqDto,
  ): Promise<CreateCommentReqDto> {
    return this.commentService.createPost(createUserReqDto);
  }
}
