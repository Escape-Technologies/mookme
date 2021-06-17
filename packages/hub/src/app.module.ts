import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { StepsModule } from './steps/steps.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from './steps/step.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'mookme-local',
      password: 'password',
      database: 'mookme',
      entities: [Step, User],
      synchronize: true,
    }),
    UsersModule,
    StepsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
