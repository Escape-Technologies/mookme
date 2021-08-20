import chalk from 'chalk';
import path from 'path';
import os from 'os';
import fs from 'fs';

import { getPkgJSON } from '../utils/config';
import { getRootDir } from '../utils/get-root-dir';
import { AuthConfig, ProjectConfig } from './types';

export function loadAuthConfig(): AuthConfig {
  const credentialsPath = path.join(os.homedir(), '.config', 'mookme', 'credentials.json');

  if (!fs.existsSync(path.join(credentialsPath))) {
    console.log(chalk.red.bold('No credentials found. Did you run `mookme authenticate` ?'));
    process.exit(1);
  }

  const credentials: { key: string } = JSON.parse(fs.readFileSync(credentialsPath).toString());
  return credentials;
}

export function loadProjectConfig(): ProjectConfig {
  const rootDir = getRootDir();
  const packageJSON = getPkgJSON();
  const config = packageJSON.mookme as ProjectConfig;

  if (!config) {
    console.log('Please run `mookme --init` first');
    process.exit(1);
  }

  config.packagesPath = path.resolve(`${rootDir}/${config.packagesPath}`);
  process.env.MOOKME_PROJECT_CONFIG = JSON.stringify(config);
  return config;
}
