import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { AuthUser, AuthUserType } from 'src/auth/decorator/auth-user.decorator';
import { Roles } from 'src/auth/decorator/role.decorator';
import { Role } from 'src/user/type/user.enum';
import {
  CreateAnnouncementDto,
  CreatePostReqDto,
  UpdatePostReqDto,
} from './dto/req.dto';
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
    if (user.id) {
      createannouncementDto.userId = user.id;
    }
    return this.postService.createPost(createannouncementDto);
  }

  @Get()
  findAllPosts(): Promise<PostEntity[]> {
    return this.postService.findAllPosts();
  }

  @Get(':id')
  findPostByid(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postService.findPostById(id);
  }

  @Patch(':id')
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostReqDto: UpdatePostReqDto,
  ): Promise<PostEntity> {
    return this.postService.updatePost(id, updatePostReqDto);
  }

  @Put(':id')
  deletePost(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postService.deletePost(id);
  }
}
