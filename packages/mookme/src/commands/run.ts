import commander from 'commander';

import { HookType, VCSSensitiveHook } from '../types/hook.types';
import { hookPackage, processResults } from '../utils/hook-package';
import { getNotStagedFiles, detectAndProcessModifiedFiles, getStagedFiles } from '../utils/git';
import { loadHooks, setupPATH } from '../loaders/load-hooks';
import config from '../config';
import logger from '../utils/logger';
import { MookmeUI } from '../ui';

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
  // Load the different config files
  config.init();

  // Load the VCS state
  const initialNotStagedFiles = getNotStagedFiles();
  const stagedFiles = getStagedFiles();

  const { type: hookType, args: hookArgs } = opts;
  config.updateExecutionContext({
    hookArgs,
    hookType,
    stagedFiles,
  });

  // Extend the path with partial commands
  setupPATH();

  // Load packages hooks to run
  const hooks = loadHooks(hookType, { all: opts.all });
  if (hooks.length === 0) {
    return;
  }

  // Initialize the UI
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ui = new MookmeUI();

  // Run them concurrently and await the results
  const promisedHooks = hooks.map((hook) => hookPackage(hook));
  const packagesErrors = await Promise.all(promisedHooks).catch((err) => {
    logger.failure(' Unexpected error ! ');
    console.error(err);
    process.exit(1);
  });

  // Wait for events to be processed
  setTimeout(() => {
    ui.stop();
    processResults(packagesErrors);
  }, 500);

  // Do not start modified files procedure, unless we are about to commit
  if (VCSSensitiveHook.includes(opts.type)) {
    detectAndProcessModifiedFiles(initialNotStagedFiles, config.project.addedBehavior);
  }
}
