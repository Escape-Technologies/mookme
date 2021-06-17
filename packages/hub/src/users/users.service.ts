import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UserDTO } from './dtos/user-dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDTO: CreateUserDTO): Promise<User> {
    const user = this.usersRepository.create(createUserDTO);
    user.key = Math.random().toString(36).substring(7);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.usersRepository.findOne(id);
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ email });
  }

  async update(
    id: number,
    update: Partial<CreateUserDTO>,
  ): Promise<{ updatedCount: number }> {
    await this.usersRepository.update(id, update);
    return { updatedCount: 1 };
  }

  async resetKey(id: number): Promise<UserDTO> {
    const key = Math.random().toString(36).substring(7);
    await this.usersRepository.update(id, { key });
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
