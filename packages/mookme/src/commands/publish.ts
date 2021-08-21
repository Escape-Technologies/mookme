import commander from 'commander';
import fs from 'fs';
import path from 'path';
import client from '../client';
import { PublishStepBody } from '../client/types';
import config from '../config';
import logger from '../display/logger';

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
      const stepFilePath = path.join(process.cwd(), step);

      if (fs.existsSync(stepFilePath)) {
        let stepFileContent: string;

        try {
          stepFileContent = JSON.parse(fs.readFileSync(stepFilePath).toString());
        } catch (e) {
          console.log(logger.failure(`Could not read the content of file at path ${stepFilePath}. Exiting`));
          console.error(e);
          process.exit(1);
        }

        const publishStepBody: PublishStepBody = {
          name,
          apiKey: config.auth.key,
          step: stepFileContent,
        };

        const { name: stepName, id } = await client.publish(publishStepBody);
        logger.success(`${'='.repeat(7)} Success ${'='.repeat(7)}\n`);
        logger.success(`Succesfully registered step with id ${id}`);
        logger.info(`\nYou can distribute it with the following command :`);
        logger.info(`mookme install --package <package> --hook <desired-step> @<your-username>/${stepName}`);
        logger.success(`\n${'='.repeat(25)}`);
      } else {
        logger.failure(`No file found at path ${stepFilePath}. Exiting`);
        process.exit(1);
      }
    });
}
