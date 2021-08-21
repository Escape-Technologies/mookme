import chalk from 'chalk';
import { clearInterval } from 'timers';
import { PackageHook } from '../types/hook.types';
import { StepCommand } from '../types/step.types';

export enum UIExecutionStatus {
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  ERROR = 'ERROR',
  DONE = 'DONE',
}

export class StepUI {
  status: string;
  logger!: (log: string) => void;
  interval!: ReturnType<typeof setInterval>;

  constructor(step: StepCommand) {
    console.log(`→ ${chalk.bold(step.name)} > ${step.command} `);
    this.status = 'Scheduled';
    this.start();
  }

  start(): void {
    let dotStatus = '.. ';
    this.logger = console.draft(this.status + dotStatus);
    this.interval = setInterval(() => {
      switch (dotStatus) {
        case '.. ':
          dotStatus = ' ..';
          break;
        case ' ..':
          dotStatus = '. .';
          break;
        case '. .':
          dotStatus = '.. ';
          break;
      }
      this.logger(this.status + dotStatus);
    }, 100);
  }

  stop(finalMessage: string): void {
    clearInterval(this.interval);
    this.logger(finalMessage);
  }

  setStatus(status: UIExecutionStatus): void {
    switch (status) {
      case UIExecutionStatus.RUNNING:
        this.status = 'Running';
        break;
      case UIExecutionStatus.SCHEDULED:
        this.status = 'Scheduled';
        break;
      case UIExecutionStatus.ERROR:
        this.status = 'Error';
        break;
    }
  }
}
export class HookUI {
  hook: PackageHook;
  stepsUI: { [key: string]: StepUI } = {};
  header: (log: string) => void;

  constructor(hook: PackageHook) {
    this.hook = hook;
    this.header = console.draft();
    this.setHookStatus(UIExecutionStatus.RUNNING);

    for (const step of hook.steps) {
      this.stepsUI[step.name] = new StepUI(step);
    }

    console.log();
  }

  setHookStatus(status: UIExecutionStatus): void {
    switch (status) {
      case UIExecutionStatus.RUNNING:
        this.header(`${chalk.bold.inverse(` Hooks : ${this.hook.name} `)}${chalk.bgBlueBright.bold(' Running... ')}`);
        break;
      case UIExecutionStatus.DONE:
        this.header(`${chalk.bold.inverse(` Hooks : ${this.hook.name} `)}${chalk.bgGreen.bold(' Done ✓ ')}`);
        break;
      case UIExecutionStatus.ERROR:
        this.header(`${chalk.bold.inverse(` Hooks : ${this.hook.name} `)}${chalk.bgRed.bold(' Error × ')}`);
        break;
    }
  }
}

export const center = (txt: string, sep = '-'): void => {
  console.log(
    chalk.bold(sep).repeat((process.stdout.columns - txt.length - 2) / 2),
    chalk.bold(txt),
    chalk.bold(sep).repeat((process.stdout.columns - txt.length - 2) / 2),
  );
};
