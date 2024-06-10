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
} from 'typeorm';
import { Category } from '../type/post.enum';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subject: string;

  @Column()
  Content: string;

  @Column({ type: 'enum', enum: Category })
  category: Category;

  @Column({ nullable: true })
  imagePath?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  @JoinColumn()
  comments: Comment[];
}
