import { Field, InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dto/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CoreOutput {
  @Field(() => User)
  user?: User;
}

@InputType()
export class EditProfileInput extends PartialType(PickType(User, ['email', 'password'])) {}
