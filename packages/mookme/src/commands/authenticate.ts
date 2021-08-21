import fs from 'fs';
import os from 'os';
import path from 'path';

import commander from 'commander';
import inquirer from 'inquirer';

import client from '../client';
import logger from '../display/logger';

import { emailQuestion, passwordQuestion } from '../prompts/authenticate';

interface AuthenticateArguments {
  email: string;
  password: string;
}

function createMookmeConfigFolderIfNeeded() {
  const configDir = path.join(os.homedir(), '.config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }
  const mookmeConfigPath = path.join(configDir, 'mookme');
  if (!fs.existsSync(mookmeConfigPath)) {
    fs.mkdirSync(mookmeConfigPath);
  }
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
      const credentialsPath = path.join(os.homedir(), '.config', 'mookme', 'credentials.json');
      logger.success('Succesfully retrieved api key. Storing it under `~/.config/mookme/credentials.json`');
      createMookmeConfigFolderIfNeeded();
      fs.writeFileSync(credentialsPath, JSON.stringify({ key: apiKey }, null, 2));
      logger.success(`Credentials have been stored at path \`${credentialsPath}\``);
    });
}
