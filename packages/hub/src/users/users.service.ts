import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UserDTO } from './dtos/user-dto';
import { User } from './user.entity';

import * as uuid from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async checkExistence(id: number): Promise<void> {
    const count = await this.usersRepository.count({ id: id });

    console.log({ count });

    if (count === 0) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: [`User ${id} not found`],
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async create(createUserDTO: CreateUserDTO): Promise<User> {
    const user = this.usersRepository.create(createUserDTO);
    user.key = uuid.v4();
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
    const key = uuid.v4();
    await this.usersRepository.update(id, { key });
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
