import fs from 'fs';
import path from 'path';
import { HookType, PackageHook } from '../types/hook.types';
import { StepCommand } from '../types/step.types';
import { GitToolkit } from '../utils/git';
import logger from '../utils/logger';

function matchExactPath(filePath: string, to_match: string): boolean {
  const position = filePath.indexOf(to_match);
  if (position === -1) {
    return false;
  }
  const remainingPath = filePath.slice(position + to_match.length);
  return remainingPath.length > 0 ? remainingPath.startsWith('/') : true;
}

/**
 * A class defining several utilitaries used to load and prepare packages hooks to be executed
 */
export class HooksResolver {
  gitToolkit: GitToolkit;
  root: string;
  hookType: string;

  /**
   * A class defining several utilitaries used to load and prepare packages hooks to be executed
   *
   * @param gitToolkit - the {@link GitToolkit} instance to use to manage the VCS state
   */
  constructor(gitToolkit: GitToolkit, hookType: HookType) {
    this.gitToolkit = gitToolkit;
    this.root = gitToolkit.rootDir;
    this.hookType = hookType;
  }

  /**
   * Recursively retrieve the list of folders containing a hook specification with their absolute paths.
   * @param depth - the current depth of the folder exploration. Defaults to 0 for the initial call, should be increased across the recursive calls.
   * @param maxDepth - the max value accepted for the depth parameter before stopping the future recursions
   * @returns a list of strings denoting the absolute paths of the detected pakcages
   */
  extractPackagesPaths(depth = 0, maxDepth = 5, source?: string): string[] {
    const paths: string[] = [];
    const root = source || this.root;

    // Retrieve the list of directories in the root folder
    const folders = fs.readdirSync(root, { withFileTypes: true }).filter((item) => item.isDirectory());

    // For each directory, if it has a `.hooks` folder in it, add it's path to the list of packages path
    if (folders.find((folder) => folder.name === '.hooks')) {
      paths.push(root);
    }

    // Otherwise, scan it's content for eventual nested directories if the max depth is not reached
    for (const folder of folders) {
      if (depth < maxDepth) {
        paths.push(...this.extractPackagesPaths(depth + 1, maxDepth, path.join(root, folder.name)));
      }
    }

    return paths;
  }

  /**
   * Filter a list of folders absolute paths, based on if they provide a steps definition file for the provided hook type.
   * @param packagesPaths - a list of string containing the absolute paths to test
   * @returns the filtered list of absolute paths, pointing towards the folders where steps for the desired hook type are defined.
   */
  filterPackageForHookType(packagesPaths: string[]): string[] {
    return packagesPaths.filter((packagePath) => {
      const hooksFilePath = path.join(packagePath, '.hooks', `${this.hookType}.json`);
      return fs.existsSync(hooksFilePath);
    });
  }

  /**
   * Load a {@link PackageHook} object from the absolute path of the package's folder.
   * @param packagePath - the absolute path to this package
   * @param name - the displayed name of this package
   * @returns the created package hook instance
   */
  loadPackage(packagePath: string, name: string): PackageHook {
    const hooksFilePath = path.join(packagePath, '.hooks', `${this.hookType}.json`);
    const locallHooksFilePath = path.join(packagePath, '.hooks', `${this.hookType}.local.json`);

    // The assumption that the file exists can be made because of `extractPackagesPaths`
    const hooksDefinition = JSON.parse(fs.readFileSync(hooksFilePath, 'utf-8'));

    // @TODO: add data validation on the parsed object
    // @TODO: retrieve the type of the package from a separate file to ensure consistency between the local and shared steps
    const packageHook: PackageHook = {
      name,
      cwd: packagePath,
      type: hooksDefinition.type,
      venvActivate: hooksDefinition.venvActivate,
      steps: hooksDefinition.steps,
    };

    // If local steps are also defined, add them to the list of steps
    if (fs.existsSync(locallHooksFilePath)) {
      const localHooksDefinition = JSON.parse(fs.readFileSync(locallHooksFilePath, 'utf-8'));
      // Extend the local steps by adding the "local" suffix to their name
      const localSteps = localHooksDefinition.steps.map((step: { name: string }) => ({
        ...step,
        name: `${step.name} (local)`,
      }));
      packageHook.steps.push(...localSteps);
    }

    return packageHook;
  }

  /**
   * Load packages associated to a list of folder absolute paths
   * @param packagesPath - the list of absolute paths to the packages to load
   * @returns the list of loaded {@link PackageHook}
   */
  loadPackages(packagesPath: string[]): PackageHook[] {
    const packages: PackageHook[] = [];
    for (const packagePath of packagesPath) {
      // Properly format the package's name: Turn the absolute path into a relative path from the project's root
      let packageName = packagePath.replace(`${this.root}`, '');
      if (packageName.startsWith('/')) {
        packageName = packageName.substring(1);
      }
      // The only path leading to an empty string here is the package located at the project's root path, ie the global steps.
      packageName = packageName || 'global';
      // Load the package and add it to the list
      packages.push(this.loadPackage(packagePath, packageName));
    }
    return packages;
  }

  /**
   * Load every shared steps in the project and expose their content in a plain object
   * @param sharedFolderPath - the absolute path to the folder holding the shared steps.
   * @returns a dict containing the different shared steps as {@link StepCommand}, indexed with their name
   */
  loadSharedSteps(): { [key: string]: StepCommand } {
    const sharedPath = path.join(this.root, '.hooks', 'shared');

    // Return an empty collection if the folder does not exist
    if (!fs.existsSync(sharedPath)) {
      return {};
    }

    return fs.readdirSync(sharedPath).reduce((acc, sharedHookFileName) => {
      // Ensure the shared step is a valid json file
      // @TODO: Make sure the step has a valid content
      if (sharedHookFileName.split('.').pop() !== 'json') {
        return acc;
      }
      // Retrieve the shared step's name
      const sharedHookName = sharedHookFileName.replace('.json', '');
      return {
        ...acc,
        [sharedHookName]: JSON.parse(
          fs.readFileSync(path.join(sharedPath, sharedHookFileName), 'utf-8'),
        ) as StepCommand,
      };
    }, {});
  }

  /**
   * Transformed shared steps into the real step to execute, with their real command and configuration.
   * @param hooks - the list of {@link PackageHook} with steps to interpolate
   * @param sharedFolderPath - the absolute path to the folder holding the shared steps.
   * @returns the list of {@link PackageHook} with interpolated steps
   */
  interpolateSharedSteps(hooks: PackageHook[]): PackageHook[] {
    const sharedSteps = this.loadSharedSteps();

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

  /**
   * Filter a list of packages based on the VCS state, and the staged files it holds.
   * @param root - the absolute path to the root directory of the project
   * @param hooks - the list of {@link PackageHook} to filter
   * @returns the filtered list of {@link PackageHook} based on their consistency with the files staged in VCS.
   */
  filterWithVCS(hooks: PackageHook[]): PackageHook[] {
    const { staged: stagedFiles } = this.gitToolkit.getVCSState();

    const filtered = hooks.filter((hook) => {
      return !!stagedFiles.find((file) => matchExactPath(path.join(this.root, file), hook.cwd));
    });

    return filtered;
  }

  /**
   * Extend the $PATH shell variable with the scripts defined in <rootDir>/.hooks/partials
   *
   * @param root - the absolute path of the folder holding the `.mookme.json` file, where the global .hooks folder lives
   */
  setupPATH(): void {
    const partialsPath = path.join(this.root, '.hooks', 'partials');
    if (fs.existsSync(partialsPath)) {
      process.env.PATH = `${process.env.PATH}:${partialsPath}`;
    }
  }

  /**
   * A wrapper for executing the packages-retrieval flow.
   * @param root - the absolute path to the root directory of the project
   * @param hookType - the hook type to retrieve the steps for. See {@link HookType}
   * @returns the list of prepared packages to hook, filtered based on the VCS state and including interpolated shared steps.
   */
  getPreparedHooks(): PackageHook[] {
    // Retrieve every hookable package
    const allPackages: string[] = this.extractPackagesPaths();

    // Filter them to keep only the ones with hooks of the target hook type
    const packagesPathsForHookType: string[] = this.filterPackageForHookType(allPackages);

    // Build the list of available steps, including local ones. Also load the package information
    let hooks: PackageHook[] = this.loadPackages(packagesPathsForHookType);

    // Perform shared steps interpolation if needed
    hooks = this.interpolateSharedSteps(hooks);

    // Perform VCS-based filtering
    hooks = this.filterWithVCS(hooks);

    return hooks;
  }
}
