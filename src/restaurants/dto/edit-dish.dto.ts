import { Field, InputType, Int, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { Dish } from '../entities/dish.entity';
import { CoreOutput } from '../../common/dto/output.dto';

@InputType()
export class EditDishInput extends PickType(PartialType(Dish), ['name', 'options', 'price', 'description']) {
  @Field(() => Int)
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {
  @Field(() => Dish)
  dish: Dish;
}
