import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from 'src/post/post.service';
import { CommentService } from './comment.service';
import { Comment } from './entity/comment.entity';

describe('CommentService', () => {
  let commentService: CommentService;
  let postService: PostService;
  let commentRepository: Comment;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: PostService,
          useValue: {
            findPostById: jest.fn(),
          },
        },
        {
          provide: Comment,
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    postService = module.get<PostService>(PostService);
    commentRepository = module.get<Comment>(Comment);
  });

  describe('deleteCommentsByPostId', () => {
    it('should mark comments as deleted if post is found', async () => {
      const postId = 1;
      const mockPost = { id: postId, title: 'Sample Post' };

      it('should throw an error if post is not found', async () => {
        const postId = 1;

        jest
          .spyOn(postService, 'findPostById')
          .mockRejectedValue(new Error('Post not found'));

        await expect(
          commentService.deleteCommentsByPostId(postId),
        ).rejects.toThrow('Post not found');
      });
    });
  });
});
