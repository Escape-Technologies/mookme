import commander from 'commander';
import inquirer from 'inquirer';

import client from '../client';

import { emailQuestion, passwordQuestion } from '../prompts/authenticate';
import { saveKeyInConfig } from '../config/init-folders';

interface AuthenticateArguments {
  email: string;
  password: string;
}

export function addAuthenticate(program: commander.Command): void {
  program
    .command('authenticate')
    .option('-e, --email <email>', 'Your email on the mookme hub')
    .option('-p, --password <password>', 'Your password on the mookme hub')
    .description(
      'Authenticate on the hub for further usages of the cli. This will send a login request, retrieve the api-key of your account, and store it under ~/.config/mookme/credentials.json',
    )
    .action(async ({ email, password }: AuthenticateArguments) => {
      email = email ? email : ((await inquirer.prompt([emailQuestion])) as { email: string }).email;
      password = password ? password : ((await inquirer.prompt([passwordQuestion])) as { password: string }).password;

      await client.login(email, password);
      const { key: apiKey } = await client.getMe();
      saveKeyInConfig(apiKey);
    });
}
