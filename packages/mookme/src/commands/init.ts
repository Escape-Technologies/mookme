import commander from 'commander';
import { GitToolkit } from '../utils/git';
import { InitOptions, InitRunner } from '../runner/init';

export function addInit(program: commander.Command): void {
  program
    .command('init')
    .option('--only-hook', 'Skip packages definition and only write .git/hooks/${hook-type} files')
    .option('--added-behaviour <added-behaviour>', 'Provide added behaviour and skip the associated prompter')
    .option('--skip-types-selection', 'Skip hook types selection')
    .option('--yes', 'Skip confirmation prompter')
    .action(async (opts: InitOptions) => {
      const git = new GitToolkit();
      const initRunner = new InitRunner(git);
      await initRunner.run(opts);
    });
}
