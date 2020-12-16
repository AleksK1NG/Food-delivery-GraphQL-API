import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { CreatePaymentInput, CreatePaymentOutput } from './dto/create-payment.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { Roles } from '../auth/decorators/role.decorator';
import { User } from '../users/entities/user.entity';
import { GetPaymentsOutput } from './dto/get-payments.dto';

@Resolver(() => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation(() => CreatePaymentOutput)
  @Roles(['Owner'])
  createPayment(
    @AuthUser() owner: User,
    @Args('input') createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.paymentsService.createPayment(owner, createPaymentInput);
  }

  @Query(() => GetPaymentsOutput)
  @Roles(['Owner'])
  getPayments(@AuthUser() user: User): Promise<GetPaymentsOutput> {
    return this.paymentsService.getPayments(user);
  }
}
