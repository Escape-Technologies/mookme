import commander from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';

import { writeGitHooksFiles } from '../utils/git';
import { addedBehaviorQuestion, choiceQuestion, confirmQuestion, folderQuestion } from '../prompts/init';
import logger from '../display/logger';

function createDirIfNeeded(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

const clear = () => process.stdout.write('\x1Bc');

export function addInit(program: commander.Command): void {
  program
    .command('init')
    .option('--only-hook', 'Skip packages definition and only write .git/hooks/${hook-type} files')
    .option('--packages [packages...]', 'Provide packages list and skip the associated prompter')
    .option('--added-behaviour <added-behaviour>', 'Provide added behaviour and skip the associated prompter')
    .option('--packages-path <packages-path>', 'Provide packages path and skip the associated prompter')
    .option('--yes', 'Skip confirmation prompter')
    .action(async (opts) => {
      if (opts.onlyHook) {
        writeGitHooksFiles();
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
            (await inquirer.prompt([
              confirmQuestion('addSubFolder', 'Do you wanna add a subfolder for packages ?'),
            ])) as {
              addSubFolder: boolean;
            }
          ).addSubFolder;
        }
      }

      clear();
      let addedBehavior;
      if (opts.addedBehaviour) {
        addedBehavior = opts.addedBehavior;
      } else {
        addedBehavior = (await inquirer.prompt([addedBehaviorQuestion])).addedBehavior;
      }

      const mookMeConfig = {
        packagesPath: `.${packagesPath ? `/${packagesPath}` : ''}`,
        packages: selectedPackages,
        addedBehavior,
      };

      const packagesHooksDirPaths = selectedPackages.map((mod) => `${mookMeConfig.packagesPath}/${mod}/.hooks`);

      clear();
      logger.info('\nThe following configuration will be written into .mookme.json:');
      logger.log(JSON.stringify(mookMeConfig, null, 2));

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

        writeGitHooksFiles();
      }

      logger.success('Your hooks are configured.');
    });
}
