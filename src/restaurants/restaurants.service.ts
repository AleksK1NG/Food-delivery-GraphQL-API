import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dto/create-restaurant.dto';
import { User } from '../users/entities/user.entity';
import { Category } from './entities/cetegory.entity';
import { EditRestaurantInput, EditRestaurantOutput } from './dto/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dto/delete-restaurant.dto';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dto/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dto/restaurants.dto';
import { SearchRestaurantInput, SearchRestaurantOutput } from './dto/search-restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dto/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { EditDishInput, EditDishOutput } from './dto/edit-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dto/delete-dish.dto';
import { RestaurantInput, RestaurantOutput } from './dto/restaurant.dto';
import { MyRestaurantInput, MyRestaurantOutput } from './dto/my-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant) private readonly restaurantsRepository: Repository<Restaurant>,
    private readonly categoriesRepository: CategoryRepository,
    @InjectRepository(Dish)
    private readonly dishesRepository: Repository<Dish>,
  ) {}

  async getAll(): Promise<Restaurant[]> {
    return this.restaurantsRepository.find();
  }

  async createRestaurant(owner: User, input: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
    const newRestaurant = this.restaurantsRepository.create(input);

    newRestaurant.owner = owner;
    const categoryName = input.categoryName.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');

    const exists = await this.categoriesRepository.findOne({ slug: categorySlug });
    if (!exists) {
      const category = this.categoriesRepository.create({ slug: categorySlug, name: categoryName });
      newRestaurant.category = await this.categoriesRepository.save(category);
    }

    const restaurant = await this.restaurantsRepository.save(newRestaurant);

    return { ok: true, restaurant };
  }

  async editRestaurant(owner: User, editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput> {
    const restaurant = await this.restaurantsRepository.findOne({ id: editRestaurantInput.restaurantId });
    if (!restaurant) throw new NotFoundException(`restaurant with id ${editRestaurantInput.restaurantId} not found`);

    if (owner.id !== restaurant.owner.id) throw new UnauthorizedException("can't edit a restaurant that you don't own");

    let category: Category = null;
    if (editRestaurantInput.categoryName) {
      category = await this.categoriesRepository.getOrCreate(editRestaurantInput.categoryName);
    }

    const updatedRestaurant = await this.restaurantsRepository.save([
      {
        id: editRestaurantInput.restaurantId,
        ...editRestaurantInput,
        ...(category && { category }),
      },
    ]);

    return { ok: true, restaurant: { ...restaurant, ...updatedRestaurant } };
  }

  async deleteRestaurant(owner: User, { restaurantId }: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
    const restaurant = await this.restaurantsRepository.findOne({ id: restaurantId });
    if (!restaurant) throw new NotFoundException(`restaurant with id ${restaurantId} not found`);

    if (owner.id !== restaurant.owner.id)
      throw new UnauthorizedException("can't delete a restaurant that you don't own");

    await this.restaurantsRepository.delete(restaurantId);

    return { ok: true };
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    const categories = await this.categoriesRepository.find();
    return { ok: true, categories };
  }

  async countRestaurants(category: Category): Promise<number> {
    return this.restaurantsRepository.count({ category });
  }

  async findCategoryBySlug(input: CategoryInput): Promise<CategoryOutput> {
    const { slug, page, size } = input;
    const category = await this.categoriesRepository.findOne({ slug });
    if (!category) throw new NotFoundException(`category with slug ${slug} not found`);

    const restaurants = await this.restaurantsRepository.find({
      where: { category },
      order: {
        isPromoted: 'DESC',
      },
      take: size,
      skip: (page - 1) * size,
    });

    category.restaurants = restaurants;
    const totalResults = await this.countRestaurants(category);
    const totalPages = Math.ceil(totalResults / size);

    return { ok: true, category, totalResults, totalPages };
  }

  async allRestaurants(input: RestaurantsInput): Promise<RestaurantsOutput> {
    const { page, size } = input;

    const [restaurants, totalResults] = await this.restaurantsRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: {
        isPromoted: 'DESC',
      },
    });

    return {
      ok: true,
      results: restaurants,
      totalPages: Math.ceil(totalResults / size),
      totalResults,
    };
  }

  async findRestaurantById(input: RestaurantInput): Promise<RestaurantOutput> {
    const { restaurantId } = input;

    const restaurant = await this.restaurantsRepository.findOne(restaurantId, {
      relations: ['menu'],
    });
    if (!restaurant) throw new NotFoundException(`restaurant with id ${restaurantId} not found`);
    return { ok: true, restaurant };
  }

  async searchRestaurantByName(input: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    const { query, page, size } = input;

    const [restaurants, totalResults] = await this.restaurantsRepository.findAndCount({
      where: {
        name: Raw((name) => `${name} ILIKE '%${query}%'`),
      },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      ok: true,
      restaurants,
      totalResults,
      totalPages: Math.ceil(totalResults / 25),
    };
  }

  async createDish(owner: User, createDishInput: CreateDishInput): Promise<CreateDishOutput> {
    const restaurant = await this.restaurantsRepository.findOne(createDishInput.restaurantId);
    if (!restaurant) throw new NotFoundException(`restaurant with id ${createDishInput.restaurantId} not found`);
    if (owner.id !== restaurant.ownerId) throw new UnauthorizedException("can't edit a restaurant that you don't own");

    const dish = this.dishesRepository.create({ ...createDishInput, restaurant });
    const createdDish = await this.dishesRepository.save(dish);

    return { ok: true, dish: createdDish };
  }

  async editDish(owner: User, editDishInput: EditDishInput): Promise<EditDishOutput> {
    const dish = await this.dishesRepository.findOne(editDishInput.dishId, {
      relations: ['restaurant'],
    });
    if (!dish) throw new NotFoundException(`dish with id ${editDishInput.dishId} not found`);
    if (dish.restaurant.ownerId !== owner.id)
      throw new UnauthorizedException("can't edit a restaurant that you don't own");

    const updatedDish = await this.dishesRepository.save([{ id: editDishInput.dishId, ...editDishInput }]);

    return { ok: true, dish: { ...dish, ...updatedDish } };
  }

  async deleteDish(owner: User, input: DeleteDishInput): Promise<DeleteDishOutput> {
    const { dishId } = input;
    const dish = await this.dishesRepository.findOne(dishId, {
      relations: ['restaurant'],
    });
    if (!dish) throw new NotFoundException(`dish with id ${dishId} not found`);
    if (dish.restaurant.ownerId !== owner.id)
      throw new UnauthorizedException("can't edit a restaurant that you don't own");

    await this.dishesRepository.delete(dishId);

    return { ok: true };
  }

  async myRestaurant(owner: User, { id }: MyRestaurantInput): Promise<MyRestaurantOutput> {
    const restaurant = await this.restaurantsRepository.findOne({ owner, id }, { relations: ['menu', 'orders'] });
    return { restaurant, ok: true };
  }
}
