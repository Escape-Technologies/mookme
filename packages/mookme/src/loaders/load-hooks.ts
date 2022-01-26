import path from 'path';
import fs from 'fs';
import { HookType, PackageHook, VCSSensitiveHook } from '../types/hook.types';
import config, { Config } from '../config';
import logger from '../utils/logger';
import { loadSharedSteps } from './shared-steps';
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

function interpolateSharedSteps(hooks: PackageHook[], sharedFolderPath: string): PackageHook[] {
  const sharedSteps = loadSharedSteps(sharedFolderPath);

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

export function filterAndBuildHooks(
  stagedFiles: string[],
  hookType: HookType,
  config: Config,
  options: { all?: boolean } = {},
): PackageHook[] {
  const rootDir = config.project.rootDir;
  const { packages, packagesPath } = config.project;

  const packagesFromVCS = packages.filter((pkgName) => {
    if (options.all || !VCSSensitiveHook.includes(hookType)) {
      return true;
    } else {
      return !!stagedFiles.find((file) => matchExactPath(path.join(rootDir, file), path.join(packagesPath, pkgName)));
    }
  });

  function prepareHooks(pkgs: string[], local = false) {
    const hooks: PackageHook[] = [];
    pkgs
      .map((pkgName) => ({
        name: pkgName,
        path: `${packagesPath}/${pkgName}/.hooks/${hookType}${local ? '.local' : ''}.json`,
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
    return hooks;
  }

  const hooks: PackageHook[] = prepareHooks(
    packagesFromVCS.filter((pkgName) => fs.existsSync(`${packagesPath}/${pkgName}/.hooks/${hookType}.json`)),
  );

  const localHooks: PackageHook[] = prepareHooks(
    packagesFromVCS.filter((pkgName) => fs.existsSync(`${packagesPath}/${pkgName}/.hooks/${hookType}.local.json`)),
    true,
  );

  return [...hooks, ...localHooks].sort((a, b) => (a.name < b.name ? -1 : 1));
}

export const loadHooks = (hookType: HookType, opts: LoadHookOptions): PackageHook[] => {
  const stagedFiles = config.executionContext.stagedFiles || [];

  const rootDir = config.project.rootDir;
  let hooks: PackageHook[] = filterAndBuildHooks(stagedFiles, hookType, config, opts);

  if (fs.existsSync(`${rootDir}/.hooks/${hookType}.json`)) {
    const globalHook: PackageHook = {
      name: '__global',
      cwd: rootDir || process.cwd(),
      steps: JSON.parse(fs.readFileSync(`${rootDir}/.hooks/${hookType}.json`, 'utf-8')).steps,
    };

    const localHooksPath = `${rootDir}/.hooks/${hookType}.local.json`;
    if (fs.existsSync(localHooksPath)) {
      const localHook = JSON.parse(fs.readFileSync(localHooksPath, 'utf-8'));
      globalHook.steps = [...localHook.steps, ...globalHook.steps];
    }

    hooks.push(globalHook);
  }

  const sharedHookPath = path.join(rootDir, '.hooks', 'shared');
  if (fs.existsSync(sharedHookPath)) {
    hooks = interpolateSharedSteps(hooks, sharedHookPath);
  }

  return hooks;
};
