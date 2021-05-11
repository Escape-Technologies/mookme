import fs from 'fs';
import path from 'path';
import { Config } from '../types/config.types';

export function getConfig(): Config {
  let isRoot = false;
  let rootDir = process.cwd();
  while (!isRoot) {
    isRoot = fs.existsSync(`${rootDir}/.git`);
    if (!isRoot) {
      rootDir = `${rootDir}/..`;
    }
  }

  const packageJSON = JSON.parse(fs.readFileSync(`${rootDir}/package.json`, 'utf8'));
  const config = packageJSON.mookme as Config;

  if (!config) {
    console.log('Please run `mookme --init` first');
    process.exit(1);
  }

  config.packagesPath = path.resolve(`${rootDir}/${config.packagesPath}`);

  return config;
}
