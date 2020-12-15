import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dto/output.dto';

@InputType()
export class DeleteDishInput {
  @Field(() => Int)
  dishId: number;
}

@ObjectType()
export class DeleteDishOutput extends CoreOutput {}
