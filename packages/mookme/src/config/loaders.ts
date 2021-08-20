import chalk from 'chalk';
import path from 'path';
import os from 'os';
import fs from 'fs';

import { AuthConfig, CLIConfig, PkgJSON, ProjectConfig } from './types';

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
    console.log(chalk.red.bold('No credentials found. Did you run `mookme authenticate` ?'));
    process.exit(1);
  }

  const credentials: { key: string } = JSON.parse(fs.readFileSync(credentialsPath).toString());
  return credentials;
}

export function loadPkgJSON(): { [key: string]: unknown } {
  const rootDir = getRootDir();
  if (!fs.existsSync(`${rootDir}/package.json`)) {
    console.log(chalk.red.bold(`package.json file not found at path ${rootDir}`));
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(`${rootDir}/package.json`, 'utf8'));
}

export function loadPackageJSONandProjectConfig(): { project: ProjectConfig; packageJSON: PkgJSON } {
  const rootDir = getRootDir();

  if (!fs.existsSync(`${rootDir}/package.json`)) {
    console.log(chalk.red.bold(`package.json file not found at path ${rootDir}`));
    process.exit(1);
  }

  const rawPackageJSON = JSON.parse(fs.readFileSync(`${rootDir}/package.json`, 'utf8'));

  const projectConfig = rawPackageJSON.mookme as ProjectConfig;

  if (!projectConfig) {
    console.log('Please run `mookme --init` first');
    process.exit(1);
  }

  projectConfig.rootDir = rootDir;
  projectConfig.packagesPath = path.resolve(`${rootDir}/${projectConfig.packagesPath}`);

  return {
    project: projectConfig,
    packageJSON: rawPackageJSON,
  };
}
