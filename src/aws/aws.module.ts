import { Module } from '@nestjs/common';
import { AwsController } from './aws.controller';

@Module({
  controllers: [AwsController],
})
export class AwsModule {}
