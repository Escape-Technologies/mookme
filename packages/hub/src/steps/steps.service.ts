import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateStepDTO } from './dtos/create-step.dto';
import { Step } from './step.entity';

@Injectable()
export class StepsService {
  constructor(
    @InjectRepository(Step)
    private stepsRepository: Repository<Step>,
    private readonly usersService: UsersService,
  ) {}

  async create(createStepDTO: CreateStepDTO): Promise<Step> {
    const owner = await this.usersService.findByAPIKey(createStepDTO.apiKey);
    if (!owner) {
      throw new UnauthorizedException();
    }

    const potentialClash = await this.findByNameAndAuthorId(
      createStepDTO.name,
      owner.id,
    );
    if (!potentialClash) {
      const step = this.stepsRepository.create({
        ...createStepDTO,
        rawContent: JSON.stringify(createStepDTO.step),
      });
      step.owner = owner;
      const { id } = await this.stepsRepository.save(step);
      return await this.findOne(id);
    } else {
      throw new ConflictException(
        `A step with name ${createStepDTO.name} already exists`,
      );
    }
  }

  getLatest(): Promise<Step[]> {
    return this.stepsRepository
      .createQueryBuilder('steps')
      .select([
        'steps.id',
        'steps.name',
        'user.id',
        'user.email',
        'user.username',
        'steps.rawContent',
      ])
      .orderBy('created_at', 'DESC')
      .limit(10)
      .leftJoin('steps.owner', 'user') // bar is the joined table
      .getMany();
  }

  findAll(): Promise<Step[]> {
    return this.stepsRepository
      .createQueryBuilder('steps')
      .select([
        'steps.id',
        'steps.name',
        'user.id',
        'user.email',
        'user.username',
        'steps.rawContent',
      ])
      .leftJoin('steps.owner', 'user') // bar is the joined table
      .getMany();
  }

  findOne(id: number): Promise<Step> {
    return this.stepsRepository
      .createQueryBuilder('steps')
      .where({ id })
      .select([
        'steps.id',
        'steps.name',
        'user.id',
        'user.email',
        'user.username',
        'steps.rawContent',
      ])
      .leftJoin('steps.owner', 'user') // bar is the joined table
      .getOne();
  }

  async findByNameAndAuthorUsername(name: string, username: string) {
    const owner = await this.usersService.findByUsername(username);
    if (!owner) {
      throw new NotFoundException('Author does not exist');
    }
    const step = owner.steps.find((step) => step.name === name);
    if (!step) {
      throw new NotFoundException('Step does not exist');
    }
    return step;
  }

  findByNameAndAuthorId(name: string, ownerId: number) {
    return this.stepsRepository
      .createQueryBuilder('steps')
      .where({ name, owner: ownerId })
      .select([
        'steps.id',
        'steps.name',
        'user.id',
        'user.email',
        'user.username',
        'steps.rawContent',
      ])
      .leftJoin('steps.owner', 'user') // bar is the joined table
      .getOne();
  }

  async remove(id: string): Promise<void> {
    await this.stepsRepository.delete(id);
  }
}
