import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @IsString()
  @Field(() => String)
  code: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
