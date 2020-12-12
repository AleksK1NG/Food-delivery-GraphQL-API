import { Column, Entity } from 'typeorm';
import { IsEmail, IsString } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';

type UserRole = 'client' | 'owner' | 'delivery';

@Entity()
export class User extends CoreEntity {
  @Column()
  @IsEmail()
  @IsString()
  email: string;

  @Column()
  password: string;

  @Column()
  role: UserRole;
}
