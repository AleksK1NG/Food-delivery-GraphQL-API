import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dto/create-restaurant.dto';
import { User } from '../users/entities/user.entity';
import { Category } from './entities/cetegory.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant) private readonly restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(Category) private readonly categoriesRepository: Repository<Category>,
  ) {}

  async getAll(): Promise<Restaurant[]> {
    return this.restaurantsRepository.find();
  }

  async createRestaurant(input: CreateRestaurantInput, owner: User): Promise<CreateRestaurantOutput> {
    const newRestaurant = this.restaurantsRepository.create(input);

    newRestaurant.owner = owner;
    const categoryName = input.categoryName.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');

    const exists = await this.categoriesRepository.findOne({ slug: categorySlug });
    if (!exists) {
      const category = this.categoriesRepository.create({ slug: categorySlug, name: categoryName });
      newRestaurant.category = await this.categoriesRepository.save(category);
    }

    await this.restaurantsRepository.save(newRestaurant);

    return { ok: true };
  }
}
