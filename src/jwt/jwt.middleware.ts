import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JWT_AUTH_HEADER } from './jwt.constants';
import { JwtService } from './jwt.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService) {}
  async use(req: Request, res: Response, next: NextFunction): Promise<any> {
    const token = req.header(JWT_AUTH_HEADER);
    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      if (decoded) {
        const user = await this.usersService.findById(Number(decoded['id']));
        if (user) req['user'] = user;
      }
    }

    next();
  }
}
