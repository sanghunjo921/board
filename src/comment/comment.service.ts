import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentReqDto } from './dto/req.dto';
import { CreateCommentResDto } from './dto/res.dto';
import { Comment } from './entity/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async createPost({}: CreateCommentReqDto): Promise<CreateCommentResDto> {
    return;
  }
}
