import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import { JWT_CONFIG_OPTIONS } from './jwt.constants';
import { SignOptions } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(@Inject(JWT_CONFIG_OPTIONS) private readonly options: JwtModuleOptions) {}

  sign(payload: string | Buffer | Record<string, any>, options?: SignOptions): string {
    return jwt.sign(payload, this.options.privateKey, options);
  }

  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
