import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Module({
  providers: [PaymentsService]
})
export class PaymentsModule {}
