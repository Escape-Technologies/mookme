import { HooksResolver } from '../loaders/hooks-resolver';
import logger from '../utils/logger';

/**
 * A class holding the code executed in the `discover` command of Mookme.
 */
export class InspectRunner {
  resolver: HooksResolver;

  constructor(resolver: HooksResolver) {
    this.resolver = resolver;
  }

  async run(): Promise<void> {
    const root = process.cwd();
    const hookType = this.resolver.hookType;

    logger.info('');
    logger.info(`Step 1: Looking for packages under the folder '${root}'`);
    logger.info('');

    // Step 1: Retrieve every hookable package
    const allPackages: string[] = this.resolver.extractPackagesPaths();

    if (allPackages.length > 0) {
      logger.success(`Succesfully discovered ${allPackages.length} packages:`);
    } else {
      logger.failure('No packages found.');
    }
    for (const pkg of allPackages) {
      logger.info(`- ${pkg}`);
    }

    logger.info('');
    logger.info(`Step 2: Filtering packages including definitions for hook ${hookType}`);
    logger.info('');

    // Step 2: Filter them to keep only the ones with hooks of the target hook type
    const packagesPathForHookType: string[] = this.resolver.filterPackageForHookType(allPackages);

    if (packagesPathForHookType.length > 0) {
      logger.success(`Found ${packagesPathForHookType.length} packages for hook type ${hookType}:`);
    } else {
      logger.failure(`No packages found for hook type ${hookType}.`);
    }
    for (const pkg of packagesPathForHookType) {
      logger.info(`- ${pkg}`);
    }

    logger.info('');
    logger.info(`Step 3: Build the list of available steps`);
    logger.info('');

    let hooks = await this.resolver.getPreparedHooks();
    hooks = this.resolver.applyOnlyOn(hooks);

    for (const hook of hooks) {
      logger.info(`* ${hook.name}`);
      logger.log(`Path: ${hook.cwd}`);
      for (const step of hook.steps) {
        logger.log(
          step.matchedFiles.length === 0
            ? `- [SKIPPED] ${step.name} (${step.command})`
            : `- ${step.name} (${step.command})`,
        );
      }
    }
  }
}
