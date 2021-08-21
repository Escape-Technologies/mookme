import commander from 'commander';

import { hookTypes, HookType } from '../types/hook.types';
import { hookPackage, processResults } from '../utils/hook-package';
import { center } from '../display/ui';
import { getNotStagedFiles, detectAndProcessModifiedFiles, getStagedFiles } from '../utils/git';
import { loadHooks } from '../utils/load-hooks';
import config from '../config';
import logger from '../display/logger';
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
    .option('-a, --all <all>', 'Run hooks for all packages', '')
    .option('--args <args>', 'The arguments being passed to the hooks', '')
    .action(async (opts: Options) => {
      const initialNotStagedFiles = getNotStagedFiles();
      const stagedFiles = getStagedFiles();

      const { type: hookType, args: hookArgs } = opts;
      config.updateExecutionContext({
        hookArgs,
        hookType,
        stagedFiles,
      });

      if (!hookTypes.includes(hookType)) {
        logger.failure(`Invalid hook type ${hookType}. Exiting`);
        process.exit(1);
      }

      const hooks = loadHooks(hookType, { all: opts.all });

      if (hooks.length === 0) {
        return;
      }

      const title = ` Running commit hook ${hookType} `;
      console.log();
      center(title);

      // stashIfNeeded(type);

      const promisedHooks = [];

      for (const hook of hooks) {
        promisedHooks.push(hookPackage(hook));
      }

      try {
        const packagesErrors = await Promise.all(promisedHooks);
        processResults(packagesErrors);
      } catch (err) {
        logger.failure(' Unexpected error ! ');
        console.error(err);
      }

      // unstashIfNeeded(type);
      detectAndProcessModifiedFiles(initialNotStagedFiles, config.project.addedBehavior);
    });
}
