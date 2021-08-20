import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/authenticated-request.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  notFound(id: number) {
    throw new NotFoundException(`User ${id} not found`);
  }

  // @Get()
  // @UseInterceptors(ClassSerializerInterceptor)
  // async list() {
  //   return await this.usersService.findAll();
  // }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getMe(@Req() request: AuthenticatedRequest) {
    console.log('here');
    return await this.usersService.findOne(request.user.id);
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getOne(@Param() id: number) {
    return await this.usersService.findOne(id);
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() createUserDTO: CreateUserDTO) {
    if (createUserDTO.password !== createUserDTO.passwordConfirmation) {
      throw new BadRequestException('Passwords do not match');
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
        throw new BadRequestException('Passwords do not match');
      }
    }
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
