import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { StepsModule } from './steps/steps.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config/config.module';
import { Config, EnvKey } from './config/config.service';
import { Step } from './steps/step.entity';
import { User } from './users/user.entity';

@Module({
  imports: [
    UsersModule,
    StepsModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: Config) => ({
        type: 'postgres',
        host: config.get(EnvKey.DATABASE_HOST),
        port: config.get<number>(EnvKey.DATABASE_PORT),
        username: config.get(EnvKey.DATABASE_USERNAME),
        password: config.get(EnvKey.DATABASE_PASSWORD),
        database: config.get(EnvKey.DATABASE_NAME),
        entities: [Step, User],
        synchronize: true,
      }),
      inject: [Config],
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
