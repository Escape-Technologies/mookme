import chalk from 'chalk';

export const center = (txt: string, sep = '-'): void => {
  console.log(
    chalk.bold(sep).repeat((process.stdout.columns - txt.length - 2) / 2),
    chalk.bold(txt),
    chalk.bold(sep).repeat((process.stdout.columns - txt.length - 2) / 2),
  );
};
