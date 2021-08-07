import chalk from 'chalk';
import commander from 'commander';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export function addPublish(program: commander.Command): void {
  program
    .command('publish')
    .requiredOption('-k, --key <key>', 'Your user api key on Mookme hub')
    .requiredOption('-n, --name <key>', 'The name of the step you are posting')
    .requiredOption(
      '-s, --step <step>',
      "The step that you want to publish. Can be a path to a json file, or it's stingified content",
    )
    .description('Publish step on Mookme hub')
    .action(async ({ step, name, key }) => {
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
            if (e.response) {
              console.log(
                chalk.bgRed.white.bold(
                  `Publish failed : received response with status ${e.response.status} from the server.`,
                ),
              );
              console.log(chalk.bold(`${'='.repeat(7)} Error content ${'='.repeat(7)}\n`));
              console.log(e.response.data);
              console.log(chalk.bold(`\n${'='.repeat(29)}`));
            } else {
              console.log(chalk.bgRed.white.bold(`Publish failed : received no response from the server.`));
              console.log(chalk.bold(`${'='.repeat(7)} Error content ${'='.repeat(7)}\n`));
              console.error(e);
              console.log(chalk.bold(`\n${'='.repeat(29)}`));
            }
          } else {
            console.log(chalk.bgRed.white.bold(`An unknown error occured while publishing the step`));
            console.error(e);
          }
        }
      }
    });
}
