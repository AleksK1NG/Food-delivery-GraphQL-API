import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { User } from '../users/entities/user.entity';
import { CreatePaymentInput, CreatePaymentOutput } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepository: Repository<Restaurant>,
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
}
