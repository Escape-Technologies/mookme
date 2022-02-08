import commander from 'commander';

import { GitToolkit } from '../utils/git';
import config from '../config';
import { MookmeUI } from '../ui';
import { RunOptions, RunRunner } from '../runner/run';
import { HooksResolver } from '../loaders/hooks-resolver';

/**
 * Extend an existing commander program instance with the `run` command of Mookme
 *
 * @param program - the instance of the commander program to extend
 */
export function addRun(program: commander.Command): void {
  program
    .command('run')
    .requiredOption(
      '-t, --type <type>',
      'A valid git hook type ("pre-commit", "prepare-commit", "commit-msg", "post-commit")',
    )
    .option('-a, --all <all>', 'Run hooks for all packages', '')
    .option('--args <args>', 'The arguments being passed to the hooks', '')
    .action(async (opts: RunOptions) => {
      // Load the different config files
      config.init();

      // Initialize the UI
      const ui = new MookmeUI(false);
      const git = new GitToolkit();
      const resolver = new HooksResolver(git);

      // Instanciate a runner instance for the run command, and start it against the provided options
      const runner = new RunRunner(ui, config, git, resolver);
      await runner.run(opts);
    });
}
