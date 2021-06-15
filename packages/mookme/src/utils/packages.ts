import path from 'path';
import fs from 'fs';
import { PackageHook } from '../types/hook.types';
import { getConfig } from './get-config';

export interface LoadHookOptions {
  all?: boolean;
}

export const loadHooks = (stagedFiles: string[], hookType: string, opts: LoadHookOptions): PackageHook[] => {
  const hooks: PackageHook[] = [];

  const { packages, packagesPath } = getConfig();

  packages
    .filter((pkgName) => {
      if (opts.all) {
        return true;
      } else {
        return !!stagedFiles.find((file) =>
          `${process.env.ROOT_DIR}/${file}`.includes(path.join(packagesPath, pkgName)),
        );
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
      cwd: process.env.ROOT_DIR || process.cwd(),
      steps: JSON.parse(fs.readFileSync(`${packagesPath}/.hooks/${hookType}.json`, 'utf-8')).steps,
    });
  }

  return hooks;
};
