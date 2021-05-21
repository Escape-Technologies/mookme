import commander from 'commander';
import fs from 'fs';
import { execSync } from 'child_process';
import draftlog from 'draftlog';
import chalk from 'chalk';

import { hookTypes, HookType, PackageHook } from '../types/hook.types';
import { hookPackage } from '../utils/hook-package';
import { getConfig } from '../utils/get-config';
import { ADDED_BEHAVIORS } from '../types/config.types';
import { getRootDir } from '../utils/get-root-dir';

draftlog(console);

interface Options {
  type: HookType;
  args: string;
  runAll: boolean;
}

export function addRun(program: commander.Command): void {
  program
    .command('run')
    .requiredOption(
      '-t, --type <type>',
      'A valid git hook type ("pre-commit", "prepare-commit", "commit-msg", "post-commit")',
    )
    .option('-r, --run-all', 'Run hooks for all packages', '')
    .option('-a, --args <args>[]', 'The arguments being passed to the hooks', '')
    .action(async (opts: Options) => {
      process.env.MOOK_ME_ARGS = opts.args;

      const { type } = opts;
      if (!hookTypes.includes(type)) {
        console.log(`Invalid hook type ${type}`);
        process.exit(1);
      }

      const title = ` Running commit hook ${type} `;
      console.log();
      console.log(
        chalk.bold('-').repeat((process.stdout.columns - title.length - 2) / 2),
        chalk.bold(title),
        chalk.bold('-').repeat((process.stdout.columns - title.length - 2) / 2),
      );

      const { packages, packagesPath, addedBehavior } = getConfig();

      const hooks: PackageHook[] = [];

      const initialNotStagedFiles = execSync('echo $(git diff --name-only)')
        .toString()
        .split(' ')
        .map((file) => file.replace('\n', ''));
      const stagedFiles = execSync('echo $(git diff --cached --name-only)').toString().split(' ');
      const rootDir = getRootDir();
      const packagesWithChanges = packages.filter((pkg) =>
        stagedFiles.find((file) => `${rootDir}/${file}`.includes(`${packagesPath}/${pkg}`)),
      );

      const packagesToCheck = opts.runAll ? packages : packagesWithChanges;

      packagesToCheck
        .filter((name) => fs.existsSync(`${packagesPath}/${name}/.hooks/${type}.json`))
        .map((name) => ({ name, path: `${packagesPath}/${name}/.hooks/${type}.json`, cwd: `${packagesPath}/${name}` }))
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

      if (fs.existsSync(`${packagesPath}/.hooks/${type}.json`)) {
        hooks.push({
          name: '__global',
          cwd: '.',
          steps: JSON.parse(fs.readFileSync(`${packagesPath}/.hooks/${type}.json`, 'utf-8')).steps,
        });
      }

      const stashMessage = 'stashing unstaged changes in order to run hooks properly';
      const unstashMessage = 'un' + stashMessage;
      if (type === 'pre-commit') {
        console.log(chalk.bgCyan(stashMessage));
        execSync(`git stash push --keep-index --include-untracked -m "MOOKME: ${stashMessage}"`);
      }

      const promisedHooks = [];

      for (const hook of hooks.filter((hook) => hook.steps.length > 0)) {
        promisedHooks.push(hookPackage(hook));
      }

      try {
        const packagesErrors = await Promise.all(promisedHooks);
        packagesErrors.forEach((packageErrors) => {
          packageErrors.forEach((err) => {
            console.log(chalk.bgRed.white.bold(`\n Hook of package ${err.hook.name} failed at step ${err.step.name} `));
            console.log(chalk.red(err.msg));
          });
          if (packageErrors.length > 0) {
            process.exit(1);
          }
        });
      } catch (err) {
        console.log(chalk.bgRed('Unexpected error !'));
        console.error(err);
      }

      if (type === 'pre-commit') {
        console.log();
        console.log(chalk.bgCyan(unstashMessage));
        execSync('git stash pop');
      }

      const notStagedFiles = execSync('echo $(git diff --name-only)')
        .toString()
        .split(' ')
        .map((file) => file.replace('\n', ''));
      const changedFiles = notStagedFiles.filter((file) => !initialNotStagedFiles.includes(file));
      if (changedFiles.length) {
        console.log();
        switch (addedBehavior) {
          case ADDED_BEHAVIORS.ADD_AND_COMMIT:
            console.log(chalk.bgYellow.black('Files were changed during hook execution !'));
            console.log(chalk.yellow('Following the defined behavior : Add and continue.'));
            execSync(`git add ${packagesPath}`);
            break;
          case ADDED_BEHAVIORS.EXIT:
            console.log(chalk.bgYellow.black(' Files were changed during hook execution ! '));
            console.log(chalk.yellow('Following the defined behavior : Exit.'));
            process.exit(1);
            break;
        }
      }
    });
}
