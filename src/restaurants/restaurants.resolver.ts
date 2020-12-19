import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dto/create-restaurant.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { Roles } from '../auth/decorators/role.decorator';
import { EditRestaurantInput, EditRestaurantOutput } from './dto/edit-restaurant.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dto/delete-restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dto/restaurants.dto';
import { SearchRestaurantInput, SearchRestaurantOutput } from './dto/search-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dto/restaurant.dto';
import { MyRestaurantInput, MyRestaurantOutput } from './dto/my-restaurant.dto';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Query(() => [Restaurant])
  myRestaurants(): Promise<Restaurant[]> {
    return this.restaurantsService.getAll();
  }

  @Mutation(() => CreateRestaurantOutput)
  @Roles(['Owner'])
  async createRestaurant(
    @Args('input') createRestaurantInput: CreateRestaurantInput,
    @AuthUser() user: User,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantsService.createRestaurant(user, createRestaurantInput);
  }

  @Mutation(() => EditRestaurantOutput)
  @Roles(['Owner'])
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantsService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation(() => DeleteRestaurantOutput)
  @Roles(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantsService.deleteRestaurant(owner, deleteRestaurantInput);
  }

  @Query(() => RestaurantsOutput)
  allRestaurants(@Args('input') restaurantsInput: RestaurantsInput): Promise<RestaurantsOutput> {
    return this.restaurantsService.allRestaurants(restaurantsInput);
  }

  @Query(() => SearchRestaurantOutput)
  searchRestaurant(@Args('input') searchRestaurantInput: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    return this.restaurantsService.searchRestaurantByName(searchRestaurantInput);
  }

  @Query(() => RestaurantOutput)
  restaurantById(@Args('input') restaurantInput: RestaurantInput): Promise<RestaurantOutput> {
    return this.restaurantsService.findRestaurantById(restaurantInput);
  }

  @Query(() => MyRestaurantOutput)
  @Roles(['Owner'])
  myRestaurant(
    @AuthUser() owner: User,
    @Args('input') myRestaurantInput: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    return this.restaurantsService.myRestaurant(owner, myRestaurantInput);
  }
}
