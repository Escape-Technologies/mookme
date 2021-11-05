import path from 'path';
import fs from 'fs';

import { AuthConfig, CLIConfig, ProjectConfig } from '../config/types';
import logger from '../display/logger';

function getRootDir(target: string): string | undefined {
  let isRoot = false;
  let rootDir = process.cwd();
  let i = 0;
  while (!isRoot && i < 20) {
    isRoot = fs.existsSync(`${rootDir}/${target}`);
    if (!isRoot) {
      rootDir = `${rootDir}/..`;
    }
    i++;
  }
  if (!isRoot) {
    return undefined;
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

function tryMigrateLegacyConfig() {
  const legacyRootDir = getRootDir('package.json');
  if (legacyRootDir !== undefined) {
    const pkgJSON = JSON.parse(fs.readFileSync(`${legacyRootDir}/package.json`, 'utf8'));
    if (pkgJSON.mookme) {
      logger.warning(`Legacy mookme configuration object detected in package.json`);
      fs.writeFileSync(`${legacyRootDir}/.mookme.json`, JSON.stringify(pkgJSON.mookme, null, 2), 'utf8');
      delete pkgJSON.mookme;
      fs.writeFileSync(`${legacyRootDir}/package.json`, JSON.stringify(pkgJSON, null, 2), 'utf8');
      logger.success('Succesfully moved config from package.json to .mookme.json');
    }
  }
}

export function loadProjectConfig(): ProjectConfig {
  let rootDir = getRootDir('.mookme.json');

  if (rootDir === undefined) {
    tryMigrateLegacyConfig();
    rootDir = getRootDir('.mookme.json');
    if (rootDir === undefined) {
      logger.failure("Could not find any `.mookme.json` file in this folder or it's parents");
      logger.info('Did you run `mookme init` ?');
      process.exit(1);
    }
  }

  const projectConfig = JSON.parse(fs.readFileSync(`${rootDir}/.mookme.json`, 'utf8')) as ProjectConfig;
  projectConfig.rootDir = rootDir;
  projectConfig.packagesPath = path.resolve(`${rootDir}/${projectConfig.packagesPath}`);

  return projectConfig;
}
