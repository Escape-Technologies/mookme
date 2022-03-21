import chalk from 'chalk';

import Debug from 'debug';
const debug = Debug('mookme:writer');

/**
 * A small wrapper around process.stdout.write, ensuring
 * we do not log below the console, making it scroll.
 * Scrolling breaks the display because of the `console.clear` used
 * in the rendering loop.
 */
export class ConsoleCanvas {
  private _currentRow = 0;
  private _warningWritten = false;

  private debugMode: boolean;

  constructor() {
    this.debugMode = process.env.DEBUG ? process.env.DEBUG.includes('mookme') : false;
  }

  /**
   * Clear the console, and reset the lines count
   */
  clear(): void {
    if (this.debugMode) {
      return;
    }
    this._currentRow = 0;
    this._warningWritten = false;
    console.clear();
  }

  /**
   * Write a line into the console and increment the line counts
   *
   * @param line - the line to write
   */
  write(line = ''): void {
    if (this.debugMode) {
      debug(`Line to write with value "${line}"`);
      return;
    }
    if (this._currentRow + 1 < process.stdout.rows - 1) {
      process.stdout.write(line);
      process.stdout.write('\n');
      this._currentRow++;
      return;
    }
    if (this._warningWritten) {
      return;
    }
    process.stdout.write(chalk.yellow.bold('Logs have been truncated due to a small output area'));
    process.stdout.write('\n');
    this._warningWritten = true;
  }
}
