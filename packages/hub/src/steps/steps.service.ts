import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStepDTO } from './dtos/create-step.dto';
import { Step } from './step.entity';

@Injectable()
export class StepsService {
  constructor(
    @InjectRepository(Step)
    private stepsRepository: Repository<Step>,
  ) {}

  create(createStepDTO: CreateStepDTO): Promise<Step> {
    const step = this.stepsRepository.create({
      ...createStepDTO,
      rawContent: JSON.stringify(createStepDTO.step),
    });
    return this.stepsRepository.save(step);
  }

  findAll(): Promise<Step[]> {
    return this.stepsRepository.find();
  }

  findOne(id: string): Promise<Step> {
    return this.stepsRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.stepsRepository.delete(id);
  }
}
