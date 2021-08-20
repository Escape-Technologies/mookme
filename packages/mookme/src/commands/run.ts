import commander from 'commander';
import path from 'path';
import chalk from 'chalk';

import { hookTypes, HookType } from '../types/hook.types';
import { hookPackage, processResults } from '../utils/hook-package';
import { center } from '../utils/ui';
import { getStagedFiles, getNotStagedFiles, detectAndProcessModifiedFiles } from '../utils/git';
import { loadHooks } from '../utils/packages';
import config from '../config';
interface Options {
  type: HookType;
  args: string;
  all: boolean;
}

export function addRun(program: commander.Command): void {
  program
    .command('run')
    .requiredOption(
      '-t, --type <type>',
      'A valid git hook type ("pre-commit", "prepare-commit", "commit-msg", "post-commit")',
    )
    .option('-a, --all', 'Run hooks for all packages', '')
    .option('--args <args>[]', 'The arguments being passed to the hooks', '')
    .action(async (opts: Options) => {
      process.env.MOOKME_ARGS = opts.args;
      process.env.MOOKME_HOOK_TYPE = opts.type;

      const { type } = opts;

      if (!hookTypes.includes(type)) {
        console.log(`Invalid hook type ${type}`);
        process.exit(1);
      }

      const { rootDir, addedBehavior } = config.project;

      const initialNotStagedFiles = getNotStagedFiles();
      const stagedFiles = getStagedFiles();

      // Store staged files in environement for further easy retrieval
      process.env.MOOKME_STAGED_FILES = JSON.stringify(stagedFiles.map((fPath) => path.join(rootDir || '', fPath)));

      const hooks = loadHooks(stagedFiles, type, { all: opts.all });

      if (hooks.length === 0) {
        return;
      }

      const title = ` Running commit hook ${type} `;
      console.log();
      center(title);

      // stashIfNeeded(type);

      const promisedHooks = [];

      for (const hook of hooks.filter((hook) => hook.steps.length > 0)) {
        promisedHooks.push(hookPackage(hook));
      }

      try {
        const packagesErrors = await Promise.all(promisedHooks);
        processResults(packagesErrors);
      } catch (err) {
        console.log(chalk.bgRed.bold(' Unexpected error ! '));
        console.error(err);
      }

      // unstashIfNeeded(type);
      detectAndProcessModifiedFiles(initialNotStagedFiles, addedBehavior);
    });
}
