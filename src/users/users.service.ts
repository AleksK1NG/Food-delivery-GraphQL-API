import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dto/createAccount.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async createAccount(createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
    const { email } = createAccountInput;
    const exists = await this.usersRepository.findOne({ email });
    if (exists) throw new Error(`E-mail ${email} is already in use.`);

    await this.usersRepository.create({ ...createAccountInput });
    return { ok: true };
  }

  async login(loginInput: LoginInput): Promise<LoginOutput> {
    const { email, password } = loginInput;
    const user = await this.usersRepository.findOne({ email });
    if (!user) throw new NotFoundException(`User with email: ${email} not found`);

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password');

    return { ok: true, token: 'adasdsadads' };
  }
}
