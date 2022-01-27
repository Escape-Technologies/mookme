import chalk from 'chalk';
import { ExecutionStatus } from '../types/status.types';
import { UIPackageItem, UIStepItem } from './types';
import { ConsoleCanvas } from './writer';

const stepDisplayedStatuses = {
  [ExecutionStatus.CREATED]: '🗓 Created',
  [ExecutionStatus.RUNNING]: '🦾 Running...',
  [ExecutionStatus.FAILURE]: '❌ Error.',
  [ExecutionStatus.SUCCESS]: '✅ Done.',
  [ExecutionStatus.SKIPPED]: '⏩ Skipped.',
};

/**
 * A class designed for rendering the UI state object into console statements
 */
export class Renderer {
  writer: ConsoleCanvas;

  /**
   * Constructor for the renderer class
   *
   * @param canvas - a pre-defined instance of the canvas to use. It is rendered otherwise
   */
  constructor(canvas?: ConsoleCanvas) {
    this.writer = canvas || new ConsoleCanvas();
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
      this.writer.write(`${stepDisplayedStatuses[step.status]} `);
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
    switch (pkg.status) {
      case ExecutionStatus.CREATED:
        this.writer.write(`${chalk.bold.inverse(` Hooks : ${pkg.name} `)}${chalk.bold.inverse(' Created... ')}`);
        break;
      case ExecutionStatus.RUNNING:
        this.writer.write(`${chalk.bold.inverse(` Hooks : ${pkg.name} `)}${chalk.bgBlueBright.bold(' Running... ')}`);
        break;
      case ExecutionStatus.SUCCESS:
        this.writer.write(`${chalk.bold.inverse(` Hooks : ${pkg.name} `)}${chalk.bgGreen.bold(' Done ✓ ')}`);
        break;
      case ExecutionStatus.FAILURE:
        this.writer.write(`${chalk.bold.inverse(` Hooks : ${pkg.name} `)}${chalk.bgRed.bold(' Error × ')}`);
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
  }
}
