import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { Role } from 'src/user/type/user.enum';
import { UserService } from 'src/user/user.service';
import { IS_PUBLIC_KEY } from './decorator/public.decorator';
import { ROLES_KEY } from './decorator/role.decorator';
import { TokenType } from './type/auth.type';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (isPublic) {
      return true;
    }

    const http = context?.switchToHttp();

    const { url, headers } = http.getRequest<Request>();

    const token = /Bearer\s(.+)/.exec(headers.authorization)?.[1];

    if (!token) {
      throw new UnauthorizedException('no token');
    }

    const decoded = this.jwtService.decode(token);

    if (!url.includes('refresh') && decoded.type === TokenType.REFRESH) {
      throw new UnauthorizedException('refresh error');
    }

    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (roles && roles.includes(Role.ADMIN)) {
      const userId = decoded.sub;

      return this.userService.checkAdminRole(userId);
    }

    return super.canActivate(context);
  }
}
