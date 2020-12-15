import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dto/output.dto';
import { Category } from '../entities/cetegory.entity';

@ArgsType()
export class CategoryInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends CoreOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;
}
