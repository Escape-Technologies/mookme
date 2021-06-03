import commander from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';

import { execSync } from 'child_process';
import chalk from 'chalk';
import { hookTypes } from '../types/hook.types';
import { ADDED_BEHAVIORS } from '../types/config.types';

function createDirIfNeeded(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function writeGitHooksFiles() {
  createDirIfNeeded('./.git/hooks');
  console.log(chalk.bold('Writing Git hooks files'));
  hookTypes.forEach((type) => {
    console.log(chalk.bold(`- ./.git/hooks/${type}`));
    const mookmeCmd = `./node_modules/@escape.tech/mookme/bin/index.js run --type ${type} --args "$1"`;
    if (fs.existsSync(`./.git/hooks/${type}`)) {
      const hook = fs.readFileSync(`./.git/hooks/${type}`).toString();
      if (!hook.includes(mookmeCmd)) {
        fs.appendFileSync(`./.git/hooks/${type}`, `\n${mookmeCmd}`, { flag: 'a+' });
        execSync(`chmod +x ./.git/hooks/${type}`);
      } else {
        console.log(`Hook ${type} is already declared, skipping...`);
      }
    } else {
      console.log(`Hook ${type} does not exist, creating file...`);
      fs.appendFileSync(`./.git/hooks/${type}`, `#!/bin/bash\n${mookmeCmd}`, { flag: 'a+' });
      execSync(`chmod +x ./.git/hooks/${type}`);
    }
  });
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

      const folderQuestion = {
        type: 'input',
        name: 'packagesPath',
        message: 'Please enter the path of the folder containing the packages:\n',
        validate(rpath: string) {
          let pass;
          console.log({ rpath });
          try {
            pass = fs.lstatSync(`./${rpath}`).isDirectory();
          } catch (err) {
            pass = false;
          }
          if (pass) {
            return true;
          }
          return `Path ./${rpath} is not a valid folder path`;
        },
        transformer: (val: string) => `./${val}`,
      };

      clear();
      const { packagesPath } = (await inquirer.prompt([folderQuestion])) as { packagesPath: string };
      const moduleDirs = fs
        .readdirSync(`./${packagesPath}`, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map((dirent) => dirent.name);

      const packagesQuestion = [
        {
          type: 'checkbox',
          name: 'packages',
          message: 'Select folders to hook :\n',
          choices: moduleDirs,
          pageSize: process.stdout.rows / 2,
        },
      ];

      clear();
      const { packages } = (await inquirer.prompt(packagesQuestion)) as { packages: string[] };
      selectedPackages = selectedPackages.concat(packages);

      let { addSubFolder } = (await inquirer.prompt([
        {
          type: 'confirm',
          name: 'addSubFolder',
          message: 'Do you wanna add a subfolder for packages ?',
          default: false,
        },
      ])) as { addSubFolder: boolean };

      while (addSubFolder) {
        const folderQuestion = {
          type: 'input',
          name: 'subPath',
          message: 'Please enter the path of the folder containing the packages:\n',
          validate(rpath: string) {
            let pass;
            try {
              pass = fs.lstatSync(packagesPath ? `./${packagesPath}/${rpath}` : `./${rpath}`).isDirectory();
            } catch (err) {
              pass = false;
            }
            if (pass) {
              return true;
            }
            return `Path ./${rpath} is not a valid folder path`;
          },
          transformer: (val: string) => (packagesPath ? `./${packagesPath}/${val}` : `./${val}`),
        };

        const { subPath } = (await inquirer.prompt([folderQuestion])) as { subPath: string };
        const fullSubFolderPath = packagesPath ? `./${packagesPath}/${subPath}` : `./${subPath}`;
        const moduleDirs = fs
          .readdirSync(`./${fullSubFolderPath}`, { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('.'))
          .map((dirent) => dirent.name);

        const packagesQuestion = [
          {
            type: 'checkbox',
            name: 'packages',
            message: 'Select folders to hook :\n',
            choices: moduleDirs,
          },
        ];

        clear();
        const { packages } = (await inquirer.prompt(packagesQuestion)) as { packages: string[] };
        selectedPackages = selectedPackages.concat(
          packages.map((subPackage) => `${packagesPath ? `${packagesPath}/` : ''}${subPath}/${subPackage}`),
        );

        addSubFolder = (
          (await inquirer.prompt([
            {
              type: 'checkbox',
              name: 'addSubFolder',
              message: 'Do you wanna add a subfolder for packages ?\n',
              default: false,
            },
          ])) as { addSubFolder: boolean }
        ).addSubFolder;
      }

      clear();
      const { addedBehavior } = (await inquirer.prompt([
        {
          type: 'list',
          name: 'addedBehavior',
          message: 'How should mookme behave when files are changed during hooks execution :\n',
          choices: [
            {
              name: `${chalk.bold('Exit (recommended):')} fail and exit without performing the commit`,
              value: ADDED_BEHAVIORS.EXIT,
            },
            {
              name: `${chalk.bold('Add them and keep going: ')} run \`git add .\` and continue`,
              value: ADDED_BEHAVIORS.ADD_AND_COMMIT,
            },
          ],
        },
      ])) as { addedBehavior: string };

      const packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      packageJSON.mookme = {
        packagesPath,
        packages: selectedPackages,
        addedBehavior,
      };

      const mookMeConfig = {
        packagesPath: `.${packagesPath ? `/${packagesPath}` : ''}`,
        packages: selectedPackages,
        addedBehavior,
      };

      const packagesHooksDirPaths = selectedPackages.map((mod) => `${mookMeConfig.packagesPath}/${mod}/.hooks`);

      clear();
      console.log('\nThe following configuration will be added into your package.json:');
      console.log('mookme: ', JSON.stringify(mookMeConfig, null, 2));

      console.log('\nThe following directories will also be created:');
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
        console.log('Writing configuration...');
        packageJSON.mookme = mookMeConfig;
        fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 2));
        console.log('Done.');

        console.log('Initializing hooks folders...');
        createDirIfNeeded('./.hooks');
        packagesHooksDirPaths.forEach((hookDir) => {
          createDirIfNeeded(hookDir);
        });

        writeGitHooksFiles();
      }
    });
}
