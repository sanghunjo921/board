import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostReqDto } from './dto/req.dto';
import { CreatePostResDto } from './dto/res.dto';
import { Post } from './entity/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  async createPost({
    subject,
    content,
    category,
    imagePath,
  }: CreatePostReqDto): Promise<CreatePostResDto> {
    return;
  }
}
