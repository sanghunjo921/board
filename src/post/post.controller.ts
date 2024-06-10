import { Body, Controller, Post } from '@nestjs/common';
import { CreatePostReqDto } from './dto/req.dto';
import { CreatePostResDto } from './dto/res.dto';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  createPost(
    @Body()
    createUserReqDto: CreatePostReqDto,
  ): Promise<CreatePostResDto> {
    return this.postService.createPost(createUserReqDto);
  }
}
