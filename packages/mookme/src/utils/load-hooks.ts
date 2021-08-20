import path from 'path';
import fs from 'fs';
import { PackageHook } from '../types/hook.types';
import config from '../config';
import { getStagedFiles } from './git';
export interface LoadHookOptions {
  all?: boolean;
}

function matchExactPath(filePath: string, to_match: string): boolean {
  const position = filePath.indexOf(to_match);
  if (position === -1) {
    return false;
  }
  const remainingPath = filePath.slice(position + to_match.length);
  return remainingPath.length > 0 ? remainingPath.startsWith('/') : true;
}

export const loadHooks = (hookType: string, opts: LoadHookOptions): PackageHook[] => {
  const stagedFiles = getStagedFiles();

  const rootDir = config.project.rootDir;
  const { packages, packagesPath } = config.project;

  const hooks: PackageHook[] = [];
  packages
    .filter((pkgName) => {
      if (opts.all) {
        return true;
      } else {
        return !!stagedFiles.find((file) => matchExactPath(path.join(rootDir, file), path.join(packagesPath, pkgName)));
      }
    })
    .filter((pkgName) => fs.existsSync(`${packagesPath}/${pkgName}/.hooks/${hookType}.json`))
    .map((pkgName) => ({
      name: pkgName,
      path: `${packagesPath}/${pkgName}/.hooks/${hookType}.json`,
      cwd: `${packagesPath}/${pkgName}`,
    }))
    .forEach(({ name, path, cwd }) => {
      const hook = JSON.parse(fs.readFileSync(path, 'utf-8'));
      if (hook.steps.length > 0) {
        hooks.push({
          name,
          cwd,
          type: hook.type,
          venvActivate: hook.venvActivate,
          steps: hook.steps,
        });
      }
    });

  if (fs.existsSync(`${packagesPath}/.hooks/${hookType}.json`)) {
    hooks.push({
      name: '__global',
      cwd: rootDir || process.cwd(),
      steps: JSON.parse(fs.readFileSync(`${packagesPath}/.hooks/${hookType}.json`, 'utf-8')).steps,
    });
  }

  return hooks;
};
