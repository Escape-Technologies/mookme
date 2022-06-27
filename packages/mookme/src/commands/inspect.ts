import commander from 'commander';
import { Config } from '../config';
import { FilterStrategy } from '../loaders/filter-strategies/base-filter';
import { ListOfFilesPathFilter } from '../loaders/filter-strategies/list-of-files-filter';
import { HooksResolver } from '../loaders/hooks-resolver';
import { InspectRunner } from '../runner/inspect';
import { HookType } from '../types/hook.types';
import { GitToolkit } from '../utils/git';

export function addInspect(program: commander.Command): void {
  program
    .command('inspect')
    .requiredOption(
      '-t, --type <type>',
      'A valid git hook type ("pre-commit", "prepare-commit", "commit-msg", "post-commit")',
    )
    .option(
      '-f, --files [files...]',
      'A list of files paths to inspect. Paths must be relative from the repository root',
    )
    .description('Manually test wich packages are discovered and assess if your hooks are properly configured.')
    .action(async (opts: { type: HookType; files?: string[] }) => {
      const git = new GitToolkit();
      const config = new Config(git.rootDir);

      let customStrategy: FilterStrategy | undefined = undefined;
      if (opts.files && Array.isArray(opts.files)) {
        customStrategy = new ListOfFilesPathFilter(git, false, opts.files);
      }

      const resolver = new HooksResolver(git, opts.type, config.maxDepth, { customStrategy: customStrategy });
      const inspect = new InspectRunner(resolver);
      await inspect.run();
    });
}
