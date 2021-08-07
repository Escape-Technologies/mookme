import { Module, Global } from '@nestjs/common';
import { Config } from './config.service';

@Global()
@Module({ providers: [Config], exports: [Config] })
export class ConfigModule {}
