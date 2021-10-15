import path from 'path';
import fs from 'fs';
import { PackageHook } from '../types/hook.types';
import config from '../config';
import { StepCommand } from '../types/step.types';
import logger from '../display/logger';
export interface LoadHookOptions {
  all?: boolean;
}

export function setupPATH(): void {
  const { rootDir } = config.project;
  const partialsPath = path.join(rootDir, '.hooks', 'partials');
  if (fs.existsSync(partialsPath)) {
    process.env.PATH = `${process.env.PATH}:${partialsPath}`;
  }
}

function matchExactPath(filePath: string, to_match: string): boolean {
  const position = filePath.indexOf(to_match);
  if (position === -1) {
    return false;
  }
  const remainingPath = filePath.slice(position + to_match.length);
  return remainingPath.length > 0 ? remainingPath.startsWith('/') : true;
}

function interpolateSharedSteps(hooks: PackageHook[]): PackageHook[] {
  const { rootDir } = config.project;
  const sharedFolderPath = path.join(rootDir, '.hooks', 'shared');

  if (!fs.existsSync(sharedFolderPath)) {
    return hooks;
  }

  const sharedSteps: { [key: string]: StepCommand } = fs
    .readdirSync(sharedFolderPath)
    .reduce((acc, sharedHookFileName) => {
      if (sharedHookFileName.split('.').pop() !== 'json') {
        return acc;
      }
      const sharedHookName = sharedHookFileName.replace('.json', '');
      return {
        ...acc,
        [sharedHookName]: JSON.parse(
          fs.readFileSync(path.join(sharedFolderPath, sharedHookFileName), 'utf-8'),
        ) as StepCommand,
      };
    }, {});

  for (const hook of hooks) {
    const interpolatedSteps = [];
    for (const step of hook.steps) {
      if (step.from) {
        if (!sharedSteps[step.from]) {
          logger.failure(`Shared step \`${step.from}\` is referenced in hook \`${hook.name}\` but is not defined`);
          process.exit(1);
        }
        interpolatedSteps.push(sharedSteps[step.from]);
      } else {
        interpolatedSteps.push(step);
      }
    }
    hook.steps = interpolatedSteps;
  }

  return hooks;
}

export const loadHooks = (hookType: string, opts: LoadHookOptions): PackageHook[] => {
  const stagedFiles = config.executionContext.stagedFiles || [];

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

  const res = interpolateSharedSteps(hooks);

  return res;
};
