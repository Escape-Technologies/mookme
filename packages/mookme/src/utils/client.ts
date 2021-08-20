import { AxiosError } from 'axios';
import chalk from 'chalk';

export function parseAxiosError(e: AxiosError): void {
  if (e.response) {
    console.log(chalk.bgRed.white.bold(`Error : received response with status ${e.response.status} from the server.`));
    console.log(chalk.bold(`${'='.repeat(7)} Error content ${'='.repeat(7)}\n`));
    console.log(e.response.data);
    console.log(chalk.bold(`\n${'='.repeat(29)}`));
  } else {
    console.log(chalk.bgRed.white.bold(`Error : received no response from the server.`));
    console.log(chalk.bold(`${'='.repeat(7)} Error content ${'='.repeat(7)}\n`));
    console.error(e);
    console.log(chalk.bold(`\n${'='.repeat(29)}`));
  }
}
