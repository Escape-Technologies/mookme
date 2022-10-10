import chalk from 'chalk';
import { Renderer } from './renderer';
import { ExecutionStatus } from '../../types/status.types';
import { UIPackageItem, UIStepItem } from '../types';
import { ConsoleCanvas } from '../writer';

const stepDisplayedStatuses = {
  [ExecutionStatus.CREATED]: '🗓 Created',
  [ExecutionStatus.RUNNING]: '🦾 Running',
  [ExecutionStatus.FAILURE]: '❌ Error.',
  [ExecutionStatus.SUCCESS]: '✅ Done.',
  [ExecutionStatus.SKIPPED]: '⏩ Skipped.',
};

/**
 * A class designed for rendering the UI state object into console statements
 */
export class FancyRenderer implements Renderer {
  writer: ConsoleCanvas;
  dots = ['.. ', '. .', ' ..'];
  currentDotIndex = 0;
  interval: NodeJS.Timeout;

  currentPackages?: UIPackageItem[];

  /**
   * Constructor for the renderer class
   *
   * @param canvas - a pre-defined instance of the canvas to use. It is rendered otherwise
   */
  constructor(canvas?: ConsoleCanvas) {
    this.writer = canvas || new ConsoleCanvas();
    this.interval = setInterval(() => {
      this.currentDotIndex = (this.currentDotIndex + 1) % 3;
      this.currentPackages && this.render(this.currentPackages);
    }, 100);
  }

  stop(): void {
    this.interval && clearInterval(this.interval);
  }

  /**
   * Renders a step item onto the console canvas
   *
   * @param step - the step item to render
   */
  _renderStep(step: UIStepItem): void {
    let displayedCommand = step.command;
    if (step.command.length > process.stdout.columns - (step.name.length + 10)) {
      displayedCommand = step.command.substring(0, process.stdout.columns - step.name.length - 15) + '...';
    }
    this.writer.write(`→ ${chalk.bold(step.name)} > ${displayedCommand} `);
    if (step.status === ExecutionStatus.RUNNING) {
      this.writer.write(`${stepDisplayedStatuses[step.status]}${this.dots[this.currentDotIndex]} `);
    } else {
      this.writer.write(`${stepDisplayedStatuses[step.status]} `);
    }
  }

  /**
   * Renders a package item onto the console canvas
   *
   * @param pkg - the package item to render
   */
  _renderPacakage(pkg: UIPackageItem): void {
    this.writer.write();
    let message: string;
    switch (pkg.status) {
      case ExecutionStatus.CREATED:
        message = ` Created${this.dots[this.currentDotIndex]} `;
        this.writer.write(`${chalk.bold.inverse(` Hooks : ${pkg.name} `)}${chalk.bold.inverse(message)}`);
        break;
      case ExecutionStatus.RUNNING:
        message = ` Running${this.dots[this.currentDotIndex]} `;
        this.writer.write(`${chalk.bold.inverse(` Hooks : ${pkg.name} `)}${chalk.bgBlueBright.bold(message)}`);
        break;
      case ExecutionStatus.SUCCESS:
        message = ' Done ✓ ';
        this.writer.write(`${chalk.bold.inverse(` Hooks : ${pkg.name} `)}${chalk.bgGreen.bold(message)}`);
        break;
      case ExecutionStatus.FAILURE:
        message = ' Error × ';
        this.writer.write(`${chalk.bold.inverse(` Hooks : ${pkg.name} `)}${chalk.bgRed.bold(message)}`);
        break;
    }
    for (const step of pkg.steps) {
      this._renderStep(step);
    }
  }

  /**
   * Render the UI state onto the console canvas
   *
   * @param packages - the list of packages to render, resuming the UI current state
   */
  render(packages: UIPackageItem[]): void {
    this.writer.clear();

    for (const pkg of packages) {
      this._renderPacakage(pkg);
    }

    this.currentPackages = packages;
  }
}
