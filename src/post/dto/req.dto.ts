import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
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
  category: Category.INQUIRY | Category.QA;
}

export class CreateAnnouncementDto extends CreateCommon {
  @IsEnum(Category)
  category: Category.ANNOUNCEMENT;
}
