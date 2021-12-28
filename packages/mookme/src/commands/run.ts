import commander from 'commander';

import { HookType } from '../types/hook.types';
import { hookPackage, processResults } from '../utils/hook-package';
import { center } from '../display/ui';
import { getNotStagedFiles, detectAndProcessModifiedFiles, getStagedFiles } from '../utils/git';
import { loadHooks, setupPATH } from '../loaders/load-hooks';
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
    .action(run);
}

export async function run(opts: Options): Promise<void> {
  config.init();
  const initialNotStagedFiles = getNotStagedFiles();
  const stagedFiles = getStagedFiles();

  const { type: hookType, args: hookArgs } = opts;
  config.updateExecutionContext({
    hookArgs,
    hookType,
    stagedFiles,
  });

  setupPATH();
  const hooks = loadHooks(hookType, { all: opts.all });

  if (hooks.length === 0) {
    // logger.warning('No hooks to run.');
    return;
  }

  const title = ` Running commit hook ${hookType} `;
  console.log();
  center(title);

  const promisedHooks = hooks.map((hook) => hookPackage(hook));

  try {
    const packagesErrors = await Promise.all(promisedHooks);
    processResults(packagesErrors);
  } catch (err) {
    logger.failure(' Unexpected error ! ');
    console.error(err);
  }

  // unstashIfNeeded(type);
  detectAndProcessModifiedFiles(initialNotStagedFiles, config.project.addedBehavior);
}
