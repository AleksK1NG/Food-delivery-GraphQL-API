import { Body, Controller, Post } from '@nestjs/common';

@Controller('api/v1/payments')
export class PaymentsController {
  @Post('')
  processPaddlePayment(@Body() body) {
    return { ok: true, body };
  }
}
