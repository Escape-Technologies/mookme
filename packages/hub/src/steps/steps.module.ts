import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Step } from './step.entity';
import { StepsController } from './steps.controller';
import { StepsService } from './steps.service';

@Module({
  imports: [TypeOrmModule.forFeature([Step]), UsersModule],
  controllers: [StepsController],
  providers: [StepsService],
})
export class StepsModule {}
