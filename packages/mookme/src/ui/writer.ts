import chalk from 'chalk';

/**
 * A small wrapper around process.stdout.write, ensuring
 * we do not log below the console, making it scroll.
 * Scrolling breaks the display because of the `console.clear` used
 * in the rendering loop.
 */
export class ConsoleCanvas {
  private _currentRow = 0;
  private _warningWritten = false;

  /**
   * Clear the console, and reset the lines count
   */
  clear(): void {
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
