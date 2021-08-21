import path from 'path';
import os from 'os';
import fs from 'fs';

import { AuthConfig, CLIConfig, PkgJSON, ProjectConfig } from './types';
import logger from '../display/logger';

export function getRootDir(): string {
  let isRoot = false;
  let rootDir = process.cwd();
  while (!isRoot) {
    isRoot = fs.existsSync(`${rootDir}/.git`);
    if (!isRoot) {
      rootDir = `${rootDir}/..`;
    }
  }

  return path.resolve(rootDir);
}

export function loadCLIConfig(): CLIConfig {
  const cliConfigPath = path.join(os.homedir(), '.config', 'mookme', 'cli.json');

  let cliConfig: CLIConfig;
  if (!fs.existsSync(path.join(cliConfigPath))) {
    cliConfig = { backendUrl: 'http://localhost:4000' };
  } else {
    cliConfig = JSON.parse(fs.readFileSync(cliConfigPath).toString());
  }

  return cliConfig;
}

export function loadAuthConfig(): AuthConfig {
  const credentialsPath = path.join(os.homedir(), '.config', 'mookme', 'credentials.json');

  if (!fs.existsSync(path.join(credentialsPath))) {
    logger.failure('No credentials found. Exiting.');
    logger.info('Did you run `mookme authenticate` ?');
    process.exit(1);
  }

  const credentials: { key: string } = JSON.parse(fs.readFileSync(credentialsPath).toString());
  return credentials;
}

export function loadPackageJSONandProjectConfig(): { project?: ProjectConfig; packageJSON: PkgJSON } {
  const rootDir = getRootDir();

  if (!fs.existsSync(`${rootDir}/package.json`)) {
    logger.failure(`package.json file not found at path ${rootDir}. Exiting.`);
    process.exit(1);
  }

  const rawPackageJSON = JSON.parse(fs.readFileSync(`${rootDir}/package.json`, 'utf8'));

  const projectConfig = rawPackageJSON.mookme as ProjectConfig;

  if (!projectConfig) {
    return {
      project: undefined,
      packageJSON: rawPackageJSON,
    };
  }

  projectConfig.rootDir = rootDir;
  projectConfig.packagesPath = path.resolve(`${rootDir}/${projectConfig.packagesPath}`);

  return {
    project: projectConfig,
    packageJSON: rawPackageJSON,
  };
}
