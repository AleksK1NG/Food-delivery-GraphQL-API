import { CoreOutput } from '../../common/dto/output.dto';
import { Field, ObjectType } from '@nestjs/graphql';
import { Category } from '../entities/cetegory.entity';

@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
  @Field(() => [Category], { nullable: true })
  categories?: Category[];
}
