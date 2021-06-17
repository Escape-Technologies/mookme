import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from './step.entity';
import { StepsController } from './steps.controller';
import { StepsService } from './steps.service';

@Module({
  imports: [TypeOrmModule.forFeature([Step])],
  controllers: [StepsController],
  providers: [StepsService],
})
export class StepsModule {}
