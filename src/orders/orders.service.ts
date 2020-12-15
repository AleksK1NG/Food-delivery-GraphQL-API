import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Dish } from '../restaurants/entities/dish.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishesRepository: Repository<Dish>,
  ) {}

  async crateOrder(customer: User, input: CreateOrderInput): Promise<CreateOrderOutput> {
    const { restaurantId, items } = input;

    const restaurant = await this.restaurantsRepository.findOne(restaurantId);
    if (!restaurant) throw new NotFoundException(`restaurant with id ${restaurantId} not found`);

    let orderFinalPrice = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const dish = await this.dishesRepository.findOne(item.dishId);
      if (!dish) throw new NotFoundException(`dish with id ${item.dishId} not found`);

      let dishFinalPrice = dish.price;

      for (const itemOption of item.options) {
        const dishOption = dish.options.find((dishOption) => dishOption.name === itemOption.name);

        if (dishOption) {
          if (dishOption.extra) {
            dishFinalPrice = dishFinalPrice + dishOption.extra;
          } else {
            const dishOptionChoice = dishOption.choices.find((optionChoice) => optionChoice.name === itemOption.choice);
            if (dishOptionChoice && dishOptionChoice.extra) {
              dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
            }
          }
        }
      }

      orderFinalPrice = orderFinalPrice + dishFinalPrice;

      const orderItem = await this.orderItemsRepository.save(
        this.orderItemsRepository.create({
          dish,
          options: item.options,
        }),
      );
      orderItems.push(orderItem);
    }

    await this.ordersRepository.save(
      this.ordersRepository.create({
        customer,
        restaurant,
        total: orderFinalPrice,
        items: orderItems,
      }),
    );

    return { ok: true };
  }
}
