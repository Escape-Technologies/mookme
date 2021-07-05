import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { CreateStepDTO } from './dtos/create-step.dto';
import { StepsService } from './steps.service';

@Controller('steps')
export class StepsController {
  constructor(private stepsService: StepsService) {}

  @Get()
  async list() {
    return await this.stepsService.findAll();
  }

  @Get('search')
  async findByNameAndAuthor(@Query('name') name: string) {
    if (!name) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: ['Query parameter `name` is missing'],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const step = await this.stepsService.findByName(name);
    if (!step) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Bad Request',
          message: [`Found no step with name ${name}`],
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return step;
  }

  @Post()
  async create(@Body() createStepDTO: CreateStepDTO) {
    const potentialClash = await this.stepsService.findByName(
      createStepDTO.name,
    );

    if (!potentialClash) {
      return await this.stepsService.create(createStepDTO);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: [`A step with name ${createStepDTO.name} already exists`],
        },
        HttpStatus.CONFLICT,
      );
    }
  }
}
