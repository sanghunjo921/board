import { Comment } from 'src/comment/entity/comment.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { Category } from '../type/post.enum';
import { ViewCounts } from './view.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subject: string;

  @Column()
  content: string;

  @Column({ type: 'enum', enum: Category })
  category: Category;

  @Column({ nullable: true })
  imagePath?: string;

  @Column({ default: 0 })
  clickCount?: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ default: 'N' })
  isDeleted: string;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post, { eager: true })
  comments: Comment[];

  @OneToOne(() => ViewCounts, (viewCounts) => viewCounts.post)
  @JoinColumn()
  viewCount: ViewCounts;
}
