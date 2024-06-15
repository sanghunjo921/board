import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  console.log(2);
  console.log({ request });
  return request.user;
});

export interface AuthUserType {
  id: number;
}
