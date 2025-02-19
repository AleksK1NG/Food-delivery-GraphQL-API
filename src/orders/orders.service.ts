import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Dish } from '../restaurants/entities/dish.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dto/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dto/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dto/edit-order.dto';
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from '../common/common.constants';
import { PubSub } from 'graphql-subscriptions';
import { TakeOrderInput, TakeOrderOutput } from './dto/take-order.dto';

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
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createOrder(customer: User, { restaurantId, items }: CreateOrderInput): Promise<CreateOrderOutput> {
    const restaurant = await this.restaurantsRepository.findOne(restaurantId);
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    let orderFinalPrice = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const dish = await this.dishesRepository.findOne(item.dishId);
      if (!dish) throw new NotFoundException('Dish not found');

      let dishFinalPrice = dish.price;
      for (const itemOption of item.options) {
        const dishOption = dish.options.find((dishOption) => dishOption.name === itemOption.name);

        if (dishOption) {
          if (dishOption.extra) {
            dishFinalPrice = dishFinalPrice + dishOption.extra;
          } else {
            const dishOptionChoice = dishOption.choices?.find(
              (optionChoice) => optionChoice.name === itemOption.choice,
            );
            if (dishOptionChoice) {
              if (dishOptionChoice.extra) {
                dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
              }
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

    const order = await this.ordersRepository.save(
      this.ordersRepository.create({
        customer,
        restaurant,
        total: orderFinalPrice,
        items: orderItems,
      }),
    );
    await this.pubSub.publish(NEW_PENDING_ORDER, {
      pendingOrders: { order, ownerId: restaurant.ownerId },
    });
    return { ok: true, orderId: order.id, order };
  }

  async getOrders(user: User, { status }: GetOrdersInput): Promise<GetOrdersOutput> {
    let orders: Order[];
    if (user.role === UserRole.Client) {
      orders = await this.ordersRepository.find({
        where: {
          customer: user,
          ...(status && { status }),
        },
      });
    } else if (user.role === UserRole.Delivery) {
      orders = await this.ordersRepository.find({
        where: {
          driver: user,
          ...(status && { status }),
        },
      });
    } else if (user.role === UserRole.Owner) {
      const restaurants = await this.restaurantsRepository.find({
        where: {
          owner: user,
        },
        relations: ['orders'],
      });
      orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
      if (status) {
        orders = orders.filter((order) => order.status === status);
      }
    }

    return { ok: true, orders };
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  async getOrder(user: User, input: GetOrderInput): Promise<GetOrderOutput> {
    const { id: orderId } = input;
    const order = await this.ordersRepository.findOne(orderId, {
      relations: ['restaurant'],
    });
    if (!order) throw new NotFoundException(`order with id ${orderId} not found`);
    if (!this.canSeeOrder(user, order)) throw new ForbiddenException(`Forbidden`);

    return { ok: true, order };
  }

  async editOrder(user: User, { id: orderId, status }: EditOrderInput): Promise<EditOrderOutput> {
    const order = await this.ordersRepository.findOne(orderId);
    if (!order) throw new NotFoundException('Order not found.');

    if (!this.canSeeOrder(user, order)) throw new ForbiddenException("Can't see this.");

    let canEdit = true;
    if (user.role === UserRole.Client) {
      canEdit = false;
    }

    if (user.role === UserRole.Owner) {
      if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
        canEdit = false;
      }
    }

    if (user.role === UserRole.Delivery) {
      if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
        canEdit = false;
      }
    }

    if (!canEdit) throw new ForbiddenException("You can't do that.");

    await this.ordersRepository.save({
      id: orderId,
      status,
    });

    const newOrder = { ...order, status };

    if (user.role === UserRole.Owner) {
      if (status === OrderStatus.Cooked) {
        await this.pubSub.publish(NEW_COOKED_ORDER, {
          cookedOrders: newOrder,
        });
      }
    }
    await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });

    return { ok: true, order: { ...order, ...newOrder } };
  }

  async takeOrder(driver: User, { id: orderId }: TakeOrderInput): Promise<TakeOrderOutput> {
    const order = await this.ordersRepository.findOne(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (order.driver) throw new BadRequestException('This order already has a driver');
    await this.ordersRepository.save({
      id: orderId,
      driver,
    });
    await this.pubSub.publish(NEW_ORDER_UPDATE, {
      orderUpdates: { ...order, driver },
    });

    return { ok: true, order };
  }
}
