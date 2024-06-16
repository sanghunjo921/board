import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class ViewCounts {
  @PrimaryGeneratedColumn()
  id: number;

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

  @ManyToOne(() => Post, (post) => post.viewCounts)
  post: Post;
}
