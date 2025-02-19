import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { LessThan, Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { User } from '../users/entities/user.entity';
import { CreatePaymentInput, CreatePaymentOutput } from './dto/create-payment.dto';
import { GetPaymentsOutput } from './dto/get-payments.dto';
import { Interval } from '@nestjs/schedule';
import { PUB_SUB } from '../common/common.constants';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepository: Repository<Restaurant>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createPayment(owner: User, { transactionId, restaurantId }: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const restaurant = await this.restaurantsRepository.findOne(restaurantId);
    if (!restaurant) throw new NotFoundException('Restaurant not found.');
    if (restaurant.ownerId !== owner.id) throw new ForbiddenException('You are not allowed to do this.');

    await this.paymentsRepository.save(
      this.paymentsRepository.create({
        transactionId,
        user: owner,
        restaurant,
      }),
    );

    restaurant.isPromoted = true;
    const date = new Date();
    date.setDate(date.getDate() + 7);
    restaurant.promotedUntil = date;
    await this.restaurantsRepository.save(restaurant);

    return { ok: true };
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    const payments = await this.paymentsRepository.find({ user: user });
    return { ok: true, payments };
  }

  @Interval(5000)
  async checkPromotedRestaurants(): Promise<void> {
    const restaurants = await this.restaurantsRepository.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });

    await Promise.all(
      restaurants.map(async (restaurant) => {
        restaurant.isPromoted = false;
        restaurant.promotedUntil = null;
        return this.restaurantsRepository.save(restaurant);
      }),
    );
  }
}
