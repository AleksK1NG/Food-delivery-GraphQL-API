import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dto/create-account.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../jwt/jwt.service';
import { UserProfileInput } from './dto/user-profile.dto';
import { EditProfileInput } from './dto/edit-profile.dto';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

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

    const token = this.jwtService.sign({ id: user.id, email: user.email });

    return { ok: true, token: token };
  }

  async findById(userId: number): Promise<User> {
    return this.usersRepository.findOne({ id: userId });
  }

  async updateProfile(userId: number, userInput: EditProfileInput): Promise<User> {
    const result = await this.usersRepository.preload({ id: userId, ...userInput });

    return this.usersRepository.save(result);
  }
}
