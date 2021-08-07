import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UserDTO } from './dtos/user-dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async checkExistence(id: number): Promise<void> {
    if ((await this.usersRepository.count({ id: id })) === 0) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }

  async checkConflict(value: string, field = 'email'): Promise<void> {
    const potentialClash =
      field == 'email'
        ? await this.findByEmail(value)
        : await this.findByUsername(value);
    if (potentialClash) {
      throw new ConflictException(
        `A user with ${field} ${value} already exists`,
      );
    }
  }

  async create(createUserDTO: CreateUserDTO): Promise<User> {
    await this.checkConflict(createUserDTO.email);
    await this.checkConflict(createUserDTO.username, 'username');

    const user = this.usersRepository.create(createUserDTO);
    user.key = uuid.v4();
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(user.password, salt);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.usersRepository.findOne(id, { relations: ['steps'] });
  }

  async findByAPIKey(key: string): Promise<User> {
    return await this.usersRepository.findOne({ key });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ email });
  }

  async findByUsername(username: string): Promise<User> {
    return await this.usersRepository.findOne({ username });
  }

  async update(
    id: number,
    update: Partial<CreateUserDTO>,
  ): Promise<{ updatedCount: number }> {
    if (update.email) {
      await this.checkConflict(update.email);
    }
    await this.usersRepository.update(id, update);
    return { updatedCount: 1 };
  }

  async resetKey(id: number): Promise<UserDTO> {
    const key = uuid.v4();
    await this.usersRepository.update(id, { key });
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
