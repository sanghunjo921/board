import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class ViewCounts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  clickCount: number;

  @Column({ type: 'timestamp' })
  updatedClickCountDate: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ default: 'N' })
  isDeleted: string;

  @OneToOne(() => Post, (post) => post.viewCount)
  post: Post;
}
