import path from 'path';
import fs from 'fs';
import { PackageHook } from '../types/hook.types';
import { getProjectConfig } from './config';

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

export const loadHooks = (stagedFiles: string[], hookType: string, opts: LoadHookOptions): PackageHook[] => {
  const hooks: PackageHook[] = [];

  const rootDir: string = process.env.PROJECT_ROOT_DIR as string;
  const { packages, packagesPath } = getProjectConfig();

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
      hooks.push({
        name,
        cwd,
        type: hook.type,
        venvActivate: hook.venvActivate,
        steps: hook.steps,
      });
    });

  if (fs.existsSync(`${packagesPath}/.hooks/${hookType}.json`)) {
    hooks.push({
      name: '__global',
      cwd: process.env.PROJECT_ROOT_DIR || process.cwd(),
      steps: JSON.parse(fs.readFileSync(`${packagesPath}/.hooks/${hookType}.json`, 'utf-8')).steps,
    });
  }

  return hooks;
};
