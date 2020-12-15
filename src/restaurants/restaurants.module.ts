import { Module } from '@nestjs/common';
import { RestaurantsResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryResolver } from './categories.resolver';
import { Dish } from './entities/dish.entity';
import { DishResolver } from './dish.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository, Dish])],
  providers: [RestaurantsResolver, RestaurantsService, CategoryResolver, DishResolver],
})
export class RestaurantsModule {}
