import fs from 'fs';
import path from 'path';
import { Config } from '../types/config.types';
import { getRootDir } from './get-root-dir';

export function getConfig(): Config {
  const rootDir = getRootDir();
  const packageJSON = JSON.parse(fs.readFileSync(`${rootDir}/package.json`, 'utf8'));
  const config = packageJSON.mookme as Config;

  if (!config) {
    console.log('Please run `mookme --init` first');
    process.exit(1);
  }

  config.packagesPath = path.resolve(`${rootDir}/${config.packagesPath}`);

  return config;
}
