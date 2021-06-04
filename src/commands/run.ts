import commander from 'commander';
import path from 'path';
import draftlog from 'draftlog';
import chalk from 'chalk';

import { hookTypes, HookType } from '../types/hook.types';
import { hookPackage, processResults } from '../utils/hook-package';
import { loadConfig } from '../utils/get-config';
import { getRootDir } from '../utils/get-root-dir';
import { center } from '../utils/ui';
import { getStagedFiles, getNotStagedFiles, detectAndProcessModifiedFiles } from '../utils/git';
import { loadHooks } from '../utils/packages';

draftlog(console);

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

      const title = ` Running commit hook ${type} `;
      console.log();
      center(title);

      const { packages, packagesPath, addedBehavior } = loadConfig();
      process.env.MOOKME_CONFIG = JSON.stringify({ packages, packagesPath, addedBehavior });

      const initialNotStagedFiles = getNotStagedFiles();
      const stagedFiles = getStagedFiles();

      process.env.ROOT_DIR = getRootDir();
      const rootDir = process.env.ROOT_DIR;

      // Store staged files in environement for further easy retrieval
      process.env.MOOKME_STAGED_FILES = JSON.stringify(stagedFiles.map((fPath) => path.join(rootDir, fPath)));

      const hooks = loadHooks(stagedFiles, type, { all: opts.all });

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
