import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import { ADDED_BEHAVIORS } from '../config/types';
import { addedBehaviorQuestion, selectHookTypes } from '../prompts/init';
import { GitToolkit } from '../utils/git';
import logger from '../utils/logger';

const clear = () => process.stdout.write('\x1Bc');

function createDirIfNeeded(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

/**
 * The available options for the `init` command. See `addInit`
 */
export interface InitOptions {
  /**
   * Skip packages definition and only write .git/hooks/<hook-type> files
   */
  onlyHook?: boolean;
  /**
   * Provide packages list and skip the associated prompter
   */
  addedBehaviour?: ADDED_BEHAVIORS;
  /**
   * Skip hook types selection
   */
  skipTypesSelection?: boolean;
  /**
   * Skip confirmation prompter
   */
  yes?: boolean;
}

export class InitRunner {
  gitToolkit: GitToolkit;

  constructor(gitToolkit: GitToolkit) {
    this.gitToolkit = gitToolkit;
  }

  async run(opts: InitOptions): Promise<void> {
    const root = this.gitToolkit.rootDir;

    if (opts.onlyHook) {
      const hookTypes = await selectHookTypes(opts.skipTypesSelection);
      this.gitToolkit.writeGitHooksFiles(hookTypes);
      process.exit(0);
    }

    clear();
    let addedBehavior;
    if (opts.addedBehaviour) {
      addedBehavior = opts.addedBehaviour;
    } else {
      addedBehavior = (await inquirer.prompt([addedBehaviorQuestion])).addedBehavior;
    }

    const mookMeConfig = {
      addedBehavior,
    };

    const hookTypes = await selectHookTypes(opts.skipTypesSelection);

    clear();
    logger.info(`The following configuration will be written into \`${root}/.mookme.json\`:`);
    logger.log(JSON.stringify(mookMeConfig, null, 2));

    logger.info('');
    logger.info('The follwowing git hooks will be created:');
    hookTypes.forEach((t) => logger.log(`${root}/.git/hooks/${t}`));

    logger.info('');
    logger.info(`The following entries will be added into \`${root}/.gitignore\`:`);
    hookTypes.forEach((t) => logger.log(`.${t}.local.json`));

    let confirm;
    logger.log('');

    if (opts.yes) {
      confirm = true;
    } else {
      confirm = (
        await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Do you confirm ?',
            default: true,
          },
        ])
      ).confirm;
    }

    if (confirm) {
      logger.warning('');
      logger.warning('Writing configuration...');
      fs.writeFileSync('.mookme.json', JSON.stringify(mookMeConfig, null, 2));
      logger.success('Done.');

      logger.warning('Initializing hooks folders...');
      createDirIfNeeded(path.join(root, '.hooks'));
      createDirIfNeeded(path.join(root, '.hooks', 'shared'));
      fs.writeFileSync(path.join(root, '.hooks', 'shared', '.gitkeep'), '');
      createDirIfNeeded(path.join(root, '.hooks', 'partials'));
      fs.writeFileSync(path.join(root, '.hooks', 'partials', '.gitkeep'), '');
      const example = {
        steps: [
          {
            name: 'Example hook',
            command: 'echo "Hello world!"',
          },
        ],
      };
      fs.writeFileSync('./.hooks/pre-commit.json', JSON.stringify(example, null, 2));
      logger.success('An example hook has been written in `./.hooks/pre-commit.json`');

      this.gitToolkit.writeGitHooksFiles(hookTypes);
      this.gitToolkit.writeGitIgnoreFiles(hookTypes);
    }

    logger.success('Your hooks are configured.');
  }
}
