import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateStepDTO } from './dtos/create-step.dto';
import { StepsService } from './steps.service';

@Controller('steps')
export class StepsController {
  constructor(private stepsService: StepsService) {}

  @Get('latest')
  async latest() {
    return await this.stepsService.getLatest();
  }

  @Get('/from/:username/:name')
  async getByAuthorAndName(
    @Param('username') username: string,
    @Param('name') name: string,
  ) {
    return await this.stepsService.findByNameAndAuthorUsername(name, username);
  }

  @Get()
  async list() {
    return await this.stepsService.findAll();
  }

  @Post()
  async create(@Body() createStepDTO: CreateStepDTO) {
    return await this.stepsService.create(createStepDTO);
  }
}
