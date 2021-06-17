import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async list() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getOne(@Param('id') id: number) {
    return await this.usersService.findOne(id);
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
    return await this.usersService.create(createUserDTO);
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

    const { email, password } = updateUserDTO;
    return await this.usersService.update(id, { email, password });
  }
}
