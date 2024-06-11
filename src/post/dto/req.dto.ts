import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  NotEquals,
} from 'class-validator';
import { Category } from '../type/post.enum';

export class CreateCommon {
  @MaxLength(10)
  @IsString()
  subject: string;

  @MaxLength(300)
  content: string;

  @IsString()
  @IsOptional()
  imagePath?: string;

  @IsNumber()
  @IsOptional()
  userId?: number;
}

export class CreatePostReqDto extends CreateCommon {
  @IsEnum(Category)
  @NotEquals(Category.ANNOUNCEMENT)
  category: Category;
}

export class CreateAnnouncementDto extends CreateCommon {
  @IsEnum(Category)
  @NotEquals(Category.INQUIRY || Category.QA)
  category: Category;
}

export class UpdatePostReqDto {
  @MaxLength(10)
  @IsString()
  @IsOptional()
  subject?: string;

  @MaxLength(300)
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  imagePath?: string;
}
