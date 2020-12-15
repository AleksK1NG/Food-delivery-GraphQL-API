import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Category } from './entities/cetegory.entity';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { RestaurantsService } from './restaurants.service';
import { CategoryInput, CategoryOutput } from './dto/category.dto';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantsService.countRestaurants(category);
  }

  @Query(() => AllCategoriesOutput)
  async allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantsService.allCategories();
  }

  @Query(() => CategoryOutput)
  category(@Args('input') categoryInput: CategoryInput): Promise<CategoryOutput> {
    return this.restaurantsService.findCategoryBySlug(categoryInput);
  }
}
