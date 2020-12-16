import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { OrderItemOption } from '../entities/order-item.entity';
import { CoreOutput } from '../../common/dto/output.dto';

@InputType()
class CreateOrderItemInput {
  @Field(() => Int)
  dishId: number;

  @Field(() => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  restaurantId: number;

  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {
  @Field((type) => Int, { nullable: true })
  orderId?: number;
}
