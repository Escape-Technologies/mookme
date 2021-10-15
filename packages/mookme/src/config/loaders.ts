import path from 'path';
import fs from 'fs';

import { AuthConfig, CLIConfig, ProjectConfig } from './types';
import logger from '../display/logger';

export function getRootDir(): string {
  let isRoot = false;
  let rootDir = process.cwd();
  let i = 0;
  while (!isRoot && i < 20) {
    isRoot = fs.existsSync(`${rootDir}/.mookme.json`);
    if (!isRoot) {
      rootDir = `${rootDir}/..`;
    }
    i++;
  }
  if (!isRoot) {
    logger.failure("Could not find any `.mookme.json` file in this folder or it's parents");
    process.exit(1);
  }

  return path.resolve(rootDir);
}

export function loadCLIConfig(): CLIConfig {
  // const cliConfigPath = path.join(os.homedir(), '.config', 'mookme', 'cli.json');

  // let cliConfig: CLIConfig;
  // if (!fs.existsSync(path.join(cliConfigPath))) {
  //   cliConfig = { backendUrl: 'http://localhost:4000' };
  // } else {
  //   cliConfig = JSON.parse(fs.readFileSync(cliConfigPath).toString());
  // }

  return { backendUrl: 'no-op' };
}

export function loadAuthConfig(): AuthConfig {
  // const credentialsPath = path.join(os.homedir(), '.config', 'mookme', 'credentials.json');

  // if (!fs.existsSync(path.join(credentialsPath))) {
  //   logger.failure('No credentials found. Exiting.');
  //   logger.info('Did you run `mookme authenticate` ?');
  //   process.exit(1);
  // }

  // const credentials: { key: string } = JSON.parse(fs.readFileSync(credentialsPath).toString());
  return { key: 'no-op' };
}

export function loadProjectConfig(): ProjectConfig {
  const rootDir = getRootDir();

  const projectConfig = JSON.parse(fs.readFileSync(`${rootDir}/.mookme.json`, 'utf8')) as ProjectConfig;

  if (!projectConfig) {
    logger.failure('Project configuration has not been loaded. Exiting.');
    logger.info('Did you run `mookme init` ?');
    process.exit(1);
  }

  projectConfig.rootDir = rootDir;
  projectConfig.packagesPath = path.resolve(`${rootDir}/${projectConfig.packagesPath}`);

  return projectConfig;
}
