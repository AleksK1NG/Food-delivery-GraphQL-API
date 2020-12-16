import { Field, Float, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IsEnum, IsNumber } from 'class-validator';
import { OrderItem } from './order-item.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'SET NULL', nullable: true })
  customer?: User;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rides, { onDelete: 'SET NULL', nullable: true, eager: true })
  driver?: User;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, { onDelete: 'SET NULL', nullable: true, eager: true })
  restaurant?: Restaurant;

  @Field(() => [OrderItem])
  @ManyToMany(() => OrderItem, { eager: true })
  @JoinTable()
  items: OrderItem[];

  @Column({ nullable: true })
  @Field(() => Float, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
