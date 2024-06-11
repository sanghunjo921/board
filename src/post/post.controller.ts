import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AuthUser, AuthUserType } from 'src/auth/decorator/auth-user.decorator';
import { Roles } from 'src/auth/decorator/role.decorator';
import { Role } from 'src/user/type/user.enum';
import { CreateAnnouncementDto, CreatePostReqDto } from './dto/req.dto';
import { CreatePostResDto } from './dto/res.dto';
import { Post as PostEntity } from './entity/post.entity';
import { PostService } from './post.service';
import { Category } from './type/post.enum';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  createPost(
    @Body()
    createPostReqDto: CreatePostReqDto,
    @AuthUser() user: AuthUserType,
  ): Promise<CreatePostResDto> {
    if (user.id) {
      createPostReqDto.userId = user.id;
    }
    return this.postService.createPost(createPostReqDto);
  }

  @Roles(Role.ADMIN)
  @Post('/announcement')
  createAnnouncement(
    @Body()
    createannouncementDto: CreateAnnouncementDto,
    @AuthUser() user: AuthUserType,
  ): Promise<CreatePostResDto> {
    console.log({ type: typeof user.id });
    if (user.id) {
      createannouncementDto.userId = user.id;
    }
    return this.postService.createPost(createannouncementDto);
  }

  @Get(':id')
  findPostByid(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postService.findPostById(id);
  }
}
