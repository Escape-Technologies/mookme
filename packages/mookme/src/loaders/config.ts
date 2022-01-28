import path from 'path';
import fs from 'fs';

import { ProjectConfig } from '../config/types';
import logger from '../utils/logger';
import { getRootDir } from '../utils/root-dir';

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
