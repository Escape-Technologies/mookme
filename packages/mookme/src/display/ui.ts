import chalk from 'chalk';
import { PackageHook } from '../types/hook.types';
import { spin, SpinnerManager } from '../utils/spinner';

export interface UI {
  packageLogger: (log: string) => void;
  stepsSpinners: { [key: string]: SpinnerManager };
}

export function init_ui(hook: PackageHook): UI {
  const ui: UI = {
    packageLogger: console.draft(
      `${chalk.bold.inverse(` Hooks : ${hook.name} `)}${chalk.bgBlueBright.bold(' Running... ')}`,
    ),
    stepsSpinners: {},
  };
  console.log();

  for (const step of hook.steps) {
    console.log(`→ ${chalk.bold(step.name)} > ${step.command} `);
    ui.stepsSpinners[step.name] = spin('Scheduled');
  }

  return ui;
}

export const center = (txt: string, sep = '-'): void => {
  console.log(
    chalk.bold(sep).repeat((process.stdout.columns - txt.length - 2) / 2),
    chalk.bold(txt),
    chalk.bold(sep).repeat((process.stdout.columns - txt.length - 2) / 2),
  );
};
