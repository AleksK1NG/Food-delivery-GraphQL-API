import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateAccountInput, CreateAccountOutput } from './dto/createAccount.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dto/user-profile.dto';

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

  @Query(() => UserProfileOutput)
  @UseGuards(AuthGuard)
  async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
    const user = await this.usersService.findById(userProfileInput.userId);
    if (!user) throw new NotFoundException(`user with id ${userProfileInput.userId} not found`);

    return {
      ok: true,
      user,
    };
  }
}
