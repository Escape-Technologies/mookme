import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateStepDTO } from './dtos/create-step.dto';
import { StepsService } from './steps.service';

@Controller('steps')
export class StepsController {
  constructor(private stepsService: StepsService) {}

  @Get()
  async list() {
    return await this.stepsService.findAll();
  }

  @Post()
  async create(@Body() createStepDTO: CreateStepDTO) {
    return await this.stepsService.create(createStepDTO);
  }
}
