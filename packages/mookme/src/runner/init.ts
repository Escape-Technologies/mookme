import fs from 'fs';
import inquirer from 'inquirer';
import { ADDED_BEHAVIORS } from '../config/types';
import {
  addedBehaviorQuestion,
  choiceQuestion,
  confirmQuestion,
  folderQuestion,
  selectHookTypes,
} from '../prompts/init';
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
  packages?: string[];
  /**
   * Provide added behaviour and skip the associated prompter
   */
  addedBehaviour?: ADDED_BEHAVIORS;
  /**
   * Provide packages path and skip the associated prompter
   */
  packagesPath?: string;
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
    if (opts.onlyHook) {
      const hookTypes = await selectHookTypes(opts.skipTypesSelection);
      this.gitToolkit.writeGitHooksFiles(hookTypes);
      process.exit(0);
    }

    let packagesPath: string;
    if (typeof opts.packagesPath !== 'undefined') {
      packagesPath = opts.packagesPath;
    } else {
      packagesPath = (await inquirer.prompt([folderQuestion('packagesPath')])).packagesPath;
    }

    let selectedPackages: string[] = [];
    if (opts.packages) {
      selectedPackages = opts.packages;
    } else {
      clear();
      const moduleDirs = fs
        .readdirSync(`./${packagesPath}`, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map((dirent) => dirent.name);

      clear();
      const { packages } = (await inquirer.prompt([
        choiceQuestion('packages', 'Select folders to hook :\n', moduleDirs),
      ])) as { packages: string[] };
      selectedPackages = selectedPackages.concat(packages);

      let { addSubFolder } = (await inquirer.prompt([
        confirmQuestion('addSubFolder', 'Do you wanna add a subfolder for packages ?'),
      ])) as { addSubFolder: boolean };

      while (addSubFolder) {
        const { subPath } = (await inquirer.prompt([folderQuestion('subPath', packagesPath)])) as { subPath: string };
        const fullSubFolderPath = packagesPath ? `./${packagesPath}/${subPath}` : `./${subPath}`;
        const moduleDirs = fs
          .readdirSync(`./${fullSubFolderPath}`, { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('.'))
          .map((dirent) => dirent.name);

        clear();
        const { packages } = (await inquirer.prompt([
          choiceQuestion('packages', 'Select folders to hook :\n', moduleDirs),
        ])) as { packages: string[] };
        selectedPackages = selectedPackages.concat(
          packages.map((subPackage) => `${packagesPath ? `${packagesPath}/` : ''}${subPath}/${subPackage}`),
        );

        addSubFolder = (
          (await inquirer.prompt([confirmQuestion('addSubFolder', 'Do you wanna add a subfolder for packages ?')])) as {
            addSubFolder: boolean;
          }
        ).addSubFolder;
      }
    }

    clear();
    let addedBehavior;
    if (opts.addedBehaviour) {
      addedBehavior = opts.addedBehaviour;
    } else {
      addedBehavior = (await inquirer.prompt([addedBehaviorQuestion])).addedBehavior;
    }

    const mookMeConfig = {
      packagesPath: `.${packagesPath ? `/${packagesPath}` : ''}`,
      packages: selectedPackages,
      addedBehavior,
    };

    const packagesHooksDirPaths = selectedPackages.map((mod) => `${mookMeConfig.packagesPath}/${mod}/.hooks`);

    const hookTypes = await selectHookTypes(opts.skipTypesSelection);

    clear();
    logger.info('\nThe following configuration will be written into .mookme.json:');
    logger.log(JSON.stringify(mookMeConfig, null, 2));

    logger.info('\n The follwowing git hooks will be created:');
    hookTypes.forEach((t) => logger.log(`./.git/hooks/${t}`));

    logger.info('\n`.hooks/*.local.env` will be appended into the following `.gitignore` files:');
    selectedPackages
      .map((mod) => `${mookMeConfig.packagesPath}/${mod}/.gitignore`)
      .forEach((p) => logger.log(`- ${p}`));
    logger.log(`- ./.gitignore`);

    logger.info('\nThe following directories will also be created:');
    packagesHooksDirPaths.forEach((hookDir) => logger.log(`- ${hookDir}`));
    logger.log(`- ./.hooks`);

    let confirm;

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
      logger.warning('\nWriting configuration...');
      fs.writeFileSync('.mookme.json', JSON.stringify(mookMeConfig, null, 2));
      logger.success('Done.');

      logger.warning('Initializing hooks folders...');
      createDirIfNeeded('./.hooks');
      createDirIfNeeded('./.hooks/shared');
      fs.writeFileSync('./.hooks/shared/.gitkeep', '');
      createDirIfNeeded('./.hooks/partials');
      fs.writeFileSync('./.hooks/partials/.gitkeep', '');
      fs.writeFileSync(
        './.hooks/pre-commit.json',
        JSON.stringify(
          {
            steps: [
              {
                name: 'Example hook',
                command: 'echo "Hello world!"',
              },
            ],
          },
          null,
          2,
        ),
      );
      logger.success('An example hook has been written in `./.hooks/pre-commit.json`');
      packagesHooksDirPaths.forEach((hookDir) => {
        createDirIfNeeded(hookDir);
      });

      this.gitToolkit.writeGitHooksFiles(hookTypes);
      const paths = mookMeConfig.packages.map((pkg) => `${mookMeConfig.packagesPath}/${pkg}`);
      paths.push('./.gitignore');
      this.gitToolkit.writeGitIgnoreFiles(mookMeConfig.packages.map((pkg) => `${mookMeConfig.packagesPath}/${pkg}`));
    }

    logger.warning('\nAdding local hooks to .gitignore');
    fs.appendFileSync(`./.gitignore`, `\n**/.hooks/*.local.json\n`, { flag: 'a+' });

    logger.success('Your hooks are configured.');
  }
}
