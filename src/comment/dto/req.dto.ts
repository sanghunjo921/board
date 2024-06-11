import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentReqDto {
  @MaxLength(30)
  @IsString()
  content: string;

  @IsNumber()
  @IsOptional()
  level?: number;

  @IsNumber()
  @IsOptional()
  parent?: number;

  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsOptional()
  postId?: number;
}

export class UpdateCommentDto {
  @MaxLength(30)
  @IsString()
  @IsOptional()
  content?: string;
}
