import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dto/create-account.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dto/verify-email.dto';
import { UserProfileOutput } from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Verification) private readonly verificationRepository: Repository<Verification>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount(createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
    const { email } = createAccountInput;
    const exists = await this.usersRepository.findOne({ email });
    if (exists) throw new Error(`E-mail ${email} is already in use.`);

    const user = await this.usersRepository.create({ ...createAccountInput });
    await this.usersRepository.save(user);

    const verification = this.verificationRepository.create({ user });
    await this.verificationRepository.save(verification);

    return { ok: true };
  }

  async login(loginInput: LoginInput): Promise<LoginOutput> {
    const { email, password } = loginInput;

    const user = await this.usersRepository.findOne({ email }, { select: ['password', 'id', 'email'] });
    if (!user) throw new NotFoundException(`User with email: ${email} not found`);

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password');

    const token = this.jwtService.sign({ id: user.id, email: user.email });

    return { ok: true, token: token };
  }

  async findById(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ id: userId });
    if (!user) throw new NotFoundException(`user with id ${userId} not found`);

    return user;
  }

  async updateProfile(userId: number, userInput: EditProfileInput): Promise<EditProfileOutput> {
    const result = await this.usersRepository.preload({ id: userId, ...userInput });
    const user = await this.usersRepository.save(result);

    const verification = this.verificationRepository.create({ user });
    await this.verificationRepository.save(verification);

    return { ok: true };
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    const verification = await this.verificationRepository.findOne({ code }, { relations: ['user'] });
    if (!verification) throw new NotFoundException(`verification with code: ${code} not found`);

    verification.user.isVerified = true;
    await this.usersRepository.save(verification.user);

    await this.verificationRepository.delete(verification.id);

    return { ok: true };
  }
}
