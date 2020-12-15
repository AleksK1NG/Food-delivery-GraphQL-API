import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Dish } from './entities/dish.entity';
import { Roles } from '../auth/decorators/role.decorator';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { RestaurantsService } from './restaurants.service';
import { CreateDishInput, CreateDishOutput } from './dto/create-dish.dto';
import { EditDishInput, EditDishOutput } from './dto/edit-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dto/delete-dish.dto';

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Mutation(() => CreateDishOutput)
  @Roles(['Owner'])
  createDish(@AuthUser() owner: User, @Args('input') createDishInput: CreateDishInput): Promise<CreateDishOutput> {
    return this.restaurantsService.createDish(owner, createDishInput);
  }

  @Mutation(() => EditDishOutput)
  @Roles(['Owner'])
  editDish(@AuthUser() owner: User, @Args('input') editDishInput: EditDishInput): Promise<EditDishOutput> {
    // return this.restaurantsService.editDish(owner, editDishInput);
    return null;
  }

  @Mutation(() => DeleteDishOutput)
  @Roles(['Owner'])
  deleteDish(@AuthUser() owner: User, @Args('input') deleteDishInput: DeleteDishInput): Promise<DeleteDishOutput> {
    // return this.restaurantsService.deleteDish(owner, deleteDishInput);
    return null;
  }
}
