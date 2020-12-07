import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

@ArgsType()
export class CreateRestaurantDto {
  @IsString()
  @Field(() => String)
  name: string;

  @IsBoolean()
  @Field(() => Boolean)
  isVegan: boolean;

  @IsString()
  @Field(() => String)
  address: string;

  @Length(5, 20)
  @IsString()
  @Field(() => String)
  ownerName: string;
}
