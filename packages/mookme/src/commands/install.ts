import fs from 'fs';
import path from 'path';

import commander from 'commander';
import inquirer from 'inquirer';

import { HookType } from '../types/hook.types';
import config from '../config';
import client from '../client';
import logger from '../display/logger';
import { packageQuestion } from '../prompts/install';

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
      if (!Object.values(HookType).includes(hookType)) {
        logger.failure(`Invalid hook type ${hookType}. Exiting.`);
        process.exit(1);
      }

      if (!packageName) {
        packageName = (
          (await inquirer.prompt([packageQuestion(['@root', ...config.project.packages])])) as { packageName: string }
        ).packageName;
      } else {
        if (!config.project.packages.includes(packageName)) {
          logger.failure(`Package ${packageName} is not registered. Exiting`);
          process.exit(1);
        }
      }

      const [stepAuthor, stepName] = stepIdentifier.replace('@', '').split('/');
      const { content: stepContent } = await client.getStep(stepAuthor, stepName);

      const packageHooksPath = path.join(config.project.packagesPath, packageName, '.hooks');
      if (!fs.existsSync(packageHooksPath)) {
        logger.warning(`Create hook folder at path \`${packageHooksPath}\``);
        fs.mkdirSync(packageHooksPath);
      }

      const hookTypeFilePath = path.join(packageHooksPath, `${hookType}.json`);
      if (!fs.existsSync(hookTypeFilePath)) {
        logger.warning(`Create hook type file at path \`${hookTypeFilePath}\``);
        fs.writeFileSync(hookTypeFilePath, JSON.stringify({ steps: [] }));
      }

      const hookTypeContent = JSON.parse(fs.readFileSync(hookTypeFilePath).toString());
      hookTypeContent.steps.push(stepContent);

      fs.writeFileSync(hookTypeFilePath, JSON.stringify(hookTypeContent, null, 2));
    });
}
