import fs from 'fs';
import path from 'path';

import axios from 'axios';
import chalk from 'chalk';
import commander from 'commander';
import inquirer from 'inquirer';

import { parseAxiosError } from '../utils/client';
import { loadProjectConfig } from '../config/loaders';
import { StepCommand } from '../types/step.types';
import { HookType } from '../types/hook.types';

const packageQuestion = (packages: string[]) => ({
  type: 'list',
  name: 'packageName',
  message: 'Choose a package where to install the step:',
  choices: packages,
  filter(packageName: string) {
    return packageName === '@root' ? '.' : packageName;
  },
});

interface InstallArguments {
  stepIdentifier: string;
  packageName: string;
  hookType: HookType;
}

export function addInstall(program: commander.Command): void {
  program
    .command('install')
    .requiredOption(
      '-s, --step-identifier <step-identifier>',
      'The step to install in the following format: @<step-creator>/<step-name>',
    )
    .requiredOption('-t, --hook-type <hook-type>', 'The hook type where to install the step')
    .option('-p, --package-name <package-name>', 'The package xhere to install the step')
    .description('Install a step retrieved from the store in the desired package')
    .action(async ({ stepIdentifier, packageName, hookType }: InstallArguments) => {
      const config = loadProjectConfig();

      if (!Object.values(HookType).includes(hookType)) {
        console.log(chalk.red.bold(`Invalid hook type ${hookType}.`));
        process.exit(1);
      }

      if (!packageName) {
        packageName = (
          (await inquirer.prompt([packageQuestion(['@root', ...config.packages])])) as { packageName: string }
        ).packageName;
      } else {
        if (!config.packages.includes(packageName)) {
          console.log(chalk.red.bold(`Package ${packageName} is not registered.`));
          process.exit(1);
        }
      }

      const [stepAuthor, stepName] = stepIdentifier.replace('@', '').split('/');

      try {
        const { data: stepData } = await axios.get(`http://localhost:4000/steps/from/${stepAuthor}/${stepName}`);
        const stepContent: StepCommand = stepData.content;

        const packageHooksPath = path.join(config.packagesPath, packageName, '.hooks');
        if (!fs.existsSync(packageHooksPath)) {
          console.log(chalk.yellow.bold(`Create hook folder at path \`${packageHooksPath}\``));
          fs.mkdirSync(packageHooksPath);
        }

        const hookTypeFilePath = path.join(packageHooksPath, `${hookType}.json`);
        if (!fs.existsSync(hookTypeFilePath)) {
          console.log(chalk.yellow.bold(`Create hook type file at path \`${hookTypeFilePath}\``));
          fs.writeFileSync(hookTypeFilePath, JSON.stringify({ steps: [] }));
        }

        const hookTypeContent = JSON.parse(fs.readFileSync(hookTypeFilePath).toString());
        hookTypeContent.steps.push(stepContent);

        fs.writeFileSync(hookTypeFilePath, JSON.stringify(hookTypeContent, null, 2));
      } catch (e) {
        if (e.isAxiosError) {
          parseAxiosError(e);
        } else {
          console.log(chalk.bgRed.white.bold(`An unknown error occured while publishing the step`));
          console.error(e);
        }
      }
    });
}
