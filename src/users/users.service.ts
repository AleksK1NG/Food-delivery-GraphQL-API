import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dto/createAccount.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async createAccount(createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
    const { email, password, role } = createAccountInput;
    try {
      const exists = await this.usersRepository.findOne({ email });
      if (exists) return { ok: false, error: 'There is a user with that email already' };

      const user = this.usersRepository.create({ ...createAccountInput });
      await this.usersRepository.save(user);
      return { ok: true, error: null };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}
