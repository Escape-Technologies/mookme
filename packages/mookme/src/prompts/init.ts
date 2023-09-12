import chalk from 'chalk';
import inquirer from 'inquirer';
import { ADDED_BEHAVIORS } from '../config/types';
import { HookType, hookTypes } from '../types/hook.types';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const choiceQuestion = (name: string, message: string, choices: string[]) => ({
  type: 'checkbox',
  name,
  message,
  choices,
  pageSize: process.stdout.rows / 2,
});

export async function selectHookTypes(skip = false, typeToHook?: HookType): Promise<HookType[]> {
  let typesToHook: HookType[];

  if (skip) {
    // If skip is provided, skip everything and return the hook types
    typesToHook = hookTypes;
  } else if (typeToHook) {
    // If skip is not provided, but a type is provided, return the type
    typesToHook = [typeToHook];
  } else {
    // Prompt the user for the hook types
    const { types } = (await inquirer.prompt([
      choiceQuestion('types', 'Select git events to hook :\n', hookTypes),
    ])) as { types: HookType[] };
    typesToHook = types;
  }

  return typesToHook;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const confirmQuestion = (name: string, message: string) => ({
  type: 'confirm',
  name,
  message,
  default: false,
});

export const addedBehaviorQuestion = {
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
};
