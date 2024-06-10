import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Category } from '../type/post.enum';

export class CreatePostReqDto {
  @MaxLength(10)
  @IsString()
  subject: string;

  @MaxLength(300)
  content: string;

  @IsEnum(Category)
  category: Category;

  @IsString()
  @IsOptional()
  imagePath?: string;
}
