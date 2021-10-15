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
    .action(async (opts) => {
      if (opts.onlyHook) {
        writeGitHooksFiles();
        process.exit(0);
      }

      let selectedPackages: string[] = [];

      clear();
      const { packagesPath } = (await inquirer.prompt([folderQuestion('packagesPath')])) as { packagesPath: string };
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

      clear();
      const { addedBehavior } = (await inquirer.prompt([addedBehaviorQuestion])) as { addedBehavior: string };

      const mookMeConfig = {
        packagesPath: `.${packagesPath ? `/${packagesPath}` : ''}`,
        packages: selectedPackages,
        addedBehavior,
      };

      const packagesHooksDirPaths = selectedPackages.map((mod) => `${mookMeConfig.packagesPath}/${mod}/.hooks`);

      clear();
      logger.log('\nThe following configuration will be written into .mookme.json:');
      console.log(JSON.stringify(mookMeConfig, null, 2));

      logger.log('\nThe following directories will also be created:');
      packagesHooksDirPaths.forEach((hookDir) => console.log(`- ${hookDir}`));
      console.log(`- ./.hooks`);

      const { confirm } = (await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Do you confirm ?',
          default: false,
        },
      ])) as { confirm: boolean };

      if (confirm) {
        logger.warning('Writing configuration...');
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
