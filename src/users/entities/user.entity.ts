import { Column, Entity } from 'typeorm';
import { IsEmail, IsString } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';

enum UserRole {
  Owner,
  Client,
  Delivery,
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @IsEmail()
  @IsString()
  @Field(() => String)
  email: string;

  @Column()
  @Field(() => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  role: UserRole;
}
