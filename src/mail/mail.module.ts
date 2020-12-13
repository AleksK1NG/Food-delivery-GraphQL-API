import { DynamicModule, Module } from '@nestjs/common';
import { MailModuleOptions } from './mail.interfaces';
import { CONFIG_OPTIONS } from '../common/common.constants';

@Module({})
export class MailModule {
  static forRoot(options: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
      ],
      exports: [],
    };
  }
}
