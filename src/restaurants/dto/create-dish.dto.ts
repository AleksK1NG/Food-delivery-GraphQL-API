import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Dish } from '../entities/dish.entity';
import { CoreOutput } from '../../common/dto/output.dto';

@InputType()
export class CreateDishInput extends PickType(Dish, ['name', 'price', 'description', 'options']) {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {}
