import commander from 'commander';
import inquirer from 'inquirer';
import { MookmeClient } from '../client';
import { saveKeyInConfig } from '../config/init-folders';
import logger from '../display/logger';
import { passwordQuestion, usernameQuestion, emailQuestion, passwordConfirmationQuestion } from '../prompts/register';

export function addRegister(program: commander.Command): void {
  program
    .command('register')
    .description('Register on mookme hub')
    .action(async () => {
      const client = new MookmeClient();

      logger.success('Welcome on Mookme !');
      logger.log('You will need to procide the following information:');
      logger.log('- email\n- username\n- password');

      const { email } = (await inquirer.prompt([emailQuestion])) as { email: string };
      const { username } = (await inquirer.prompt([usernameQuestion])) as { username: string };
      const { password } = (await inquirer.prompt([passwordQuestion])) as { password: string };
      await inquirer.prompt([passwordConfirmationQuestion(password)]);

      const user = await client.register(email, username, password);

      const { key } = user;
      logger.success(`Succesfully registered user ${username} (${email})`);
      saveKeyInConfig(key);
    });
}
