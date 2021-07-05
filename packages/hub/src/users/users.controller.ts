import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  notFound(id: number) {
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: [`User ${id} not found`],
      },
      HttpStatus.NOT_FOUND,
    );
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async list() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getOne(@Param('id') id: number) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      return this.notFound(id);
    }
    return user;
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() createUserDTO: CreateUserDTO) {
    if (createUserDTO.password !== createUserDTO.passwordConfirmation) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: ['Passwords do not match'],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const potentialClash = await this.usersService.findByEmail(
      createUserDTO.email,
    );
    if (!potentialClash) {
      return await this.usersService.create(createUserDTO);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: [`A user with email ${createUserDTO.email} already exists`],
        },
        HttpStatus.CONFLICT,
      );
    }
  }

  @Put(':id')
  async update(
    @Param() id: number,
    @Body() updateUserDTO: Partial<CreateUserDTO>,
  ) {
    if (updateUserDTO.password) {
      if (updateUserDTO.password !== updateUserDTO.passwordConfirmation) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: ['Passwords do not match'],
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    await this.usersService.checkExistence(id);

    const { email, password } = updateUserDTO;
    return await this.usersService.update(id, { email, password });
  }

  @Patch(':id/reset-key')
  @UseInterceptors(ClassSerializerInterceptor)
  async resetKey(@Param('id') id: number) {
    await this.usersService.checkExistence(id);
    return await this.usersService.resetKey(id);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    await this.usersService.checkExistence(id);
    return await this.usersService.remove(id);
  }
}
