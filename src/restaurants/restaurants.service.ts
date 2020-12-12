import { Injectable, Logger } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  private logger = new Logger('RestaurantsService');
  constructor(@InjectRepository(Restaurant) private readonly restaurantsRepository: Repository<Restaurant>) {}

  async getAll(): Promise<Restaurant[]> {
    return this.restaurantsRepository.find();
  }

  async createRestaurant(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    try {
      const newRestaurant = this.restaurantsRepository.create(createRestaurantDto);
      const created = await this.restaurantsRepository.save(newRestaurant);
      this.logger.log(`createRestaurant: ${created.id}`);
      return created;
    } catch (error) {
      this.logger.error(`createRestaurant error`, error.stack);
      return error;
    }
  }
}
