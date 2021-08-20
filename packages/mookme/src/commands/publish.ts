import chalk from 'chalk';
import commander from 'commander';
import fs from 'fs';
import path from 'path';
import axios, { AxiosError } from 'axios';
import { parseAxiosError } from '../utils/client';
import { loadAuthConfig } from '../config/loaders';

export function addPublish(program: commander.Command): void {
  program
    .command('publish')
    .requiredOption('-n, --name <key>', 'The name of the step you are posting')
    .requiredOption(
      '-s, --step <step>',
      "The step that you want to publish. Can be a path to a json file, or it's stingified content",
    )
    .description('Publish step on Mookme hub')
    .action(async ({ step, name }) => {
      const { key } = loadAuthConfig();

      const stepFilePath = path.join(process.cwd(), step);

      if (fs.existsSync(stepFilePath)) {
        let stepFileContent: string;

        try {
          stepFileContent = JSON.parse(fs.readFileSync(stepFilePath).toString());
        } catch (e) {
          console.log(chalk.bold.red(`Could not read the content of file at path ${stepFilePath}`));
          console.error(e);
          process.exit(1);
        }

        const createBody = {
          name,
          apiKey: key,
          step: stepFileContent,
        };

        try {
          const { data } = await axios.post('http://localhost:4000/steps', createBody);
          console.log(chalk.bold(`${'='.repeat(7)} Success ${'='.repeat(7)}\n`));
          console.log(chalk.green.bold(`Succesfully registered step with id ${data.id}`));
          console.log(chalk.bold(`\nYou can distribute it with the following command :`));
          console.log(chalk.bold(`mookme install --package <package> --hook <desired-step> @maxencel/${data.name}`));
          console.log(chalk.bold(`\n${'='.repeat(25)}`));
        } catch (e) {
          if (e.isAxiosError) {
            parseAxiosError(e as AxiosError);
          } else {
            console.log(chalk.bgRed.white.bold(`An unknown error occured while publishing the step`));
            console.error(e);
          }
        }
      } else {
        console.log(chalk.red.bold(`No file found at path ${stepFilePath}`));
      }
    });
}
