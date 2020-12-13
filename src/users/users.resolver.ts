import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateAccountInput, CreateAccountOutput } from './dto/createAccount.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  async me(@AuthUser() user: User): Promise<User> {
    return user;
  }
}
