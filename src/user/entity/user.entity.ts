import { RefreshToken } from 'src/auth/entity/refreshToken.entity';
import { Comment } from 'src/comment/entity/comment.entity';
import { Post } from 'src/post/entity/post.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Role } from '../type/user.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role })
  role: Role = Role.REGULAR;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;

  @OneToMany(() => Comment, (comment) => comment.user)
  @JoinColumn()
  comments: Comment[];

  @OneToMany(() => Post, (post) => post.user)
  @JoinColumn()
  posts: Post[];
}
