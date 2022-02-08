import commander from 'commander';
import { HooksResolver } from '../loaders/hooks-resolver';
import { InspectRunner } from '../runner/inspect';
import { GitToolkit } from '../utils/git';

export function addInspect(program: commander.Command): void {
  program
    .command('inspect')
    .description('Manually test wich packages are discovered and assess if your hooks are properly configured.')
    .action(async () => {
      const git = new GitToolkit();
      const resolver = new HooksResolver(git);
      const inspect = new InspectRunner(resolver);
      await inspect.run();
    });
}
