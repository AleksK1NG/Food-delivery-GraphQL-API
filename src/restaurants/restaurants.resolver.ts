import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  @Query(() => [Restaurant])
  async userRestaurants(@Args('veganOnly') veganOnly: boolean): Promise<Restaurant[]> {
    return [];
  }

  @Mutation(() => Restaurant)
  async createRestaurant(@Args() createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    console.log('createRestaurantDto ', createRestaurantDto);
    return null;
  }
}
