import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export enum EnvKey {
  DATABASE_HOST = 'DATABASE_HOST',
  DATABASE_USERNAME = 'DATABASE_USERNAME',
  DATABASE_PASSWORD = 'DATABASE_PASSWORD',
  DATABASE_PORT = 'DATABASE_PORT',
  DATABASE_NAME = 'DATABASE_NAME',
  JWT_SECRET = 'JWT_SECRET',
}

export type EnvConfig = { [key in EnvKey]: any };

function readEnvFile(env: string): EnvConfig {
  const configFilePath = `${env}.env`;
  const configFolderPath = env === 'test' ? '../env' : '../../env';
  const envPath = path.resolve(__dirname, configFolderPath, configFilePath);
  const parsedEnv: unknown = dotenv.parse(fs.readFileSync(envPath));
  return parsedEnv as EnvConfig;
}
@Injectable()
export class Config {
  private readonly envConfig: EnvConfig;

  constructor() {
    const parsedEnv = readEnvFile(process.env.NODE_ENV || 'development');
    Object.keys(EnvKey).forEach((envKey) => {
      if (process.env.hasOwnProperty(envKey)) {
        parsedEnv[envKey] = process.env[envKey];
      }
    });
    this.envConfig = parsedEnv;
  }

  get<T = string>(key: EnvKey): T {
    return this.envConfig[key];
  }
}
