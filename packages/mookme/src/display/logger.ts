import chalk from 'chalk';

export class Logger {
  success(log: string): void {
    console.log(chalk.green.bold(log));
  }

  failure(log: string): void {
    console.log(chalk.red.bold(log));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(log: string): void {
    console.log(log);
  }

  info(log: string): void {
    console.log(chalk.bold(log));
  }

  warning(log: string): void {
    console.log(chalk.yellow.bold(log));
  }
}

export default new Logger();
