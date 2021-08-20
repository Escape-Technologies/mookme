import fs from 'fs';
import os from 'os';
import path from 'path';

import axios from 'axios';
import chalk from 'chalk';
import commander from 'commander';
import inquirer from 'inquirer';

import { parseAxiosError } from '../utils/client';

const emailQuestion = {
  type: 'input',
  name: 'email',
  message: 'Please enter your email on the mookme hub: ',
};

const passwordQuestion = {
  type: 'password',
  name: 'password',
  message: 'Your password on the mookme hub: ',
  mask: '*',
};

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

      try {
        const { data: authData } = await axios.post('http://localhost:4000/auth/login', { email, password });
        const accessToken: string = authData.access_token;
        const { data: userData } = await axios.get('http://localhost:4000/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const api_key = userData.key;
        if (api_key) {
          const credentialsPath = path.join(os.homedir(), '.config', 'mookme', 'credentials.json');
          console.log(
            chalk.green.bold('Succesfully retrieved api key. Storing it under `~/.config/mookme/credentials.json`'),
          );
          createMookmeConfigFolderIfNeeded();
          fs.writeFileSync(credentialsPath, JSON.stringify({ key: api_key }, null, 2));
          console.log(chalk.green.bold(`Credentials have been stored at path \`${credentialsPath}\``));
        }
      } catch (e) {
        if (e.isAxiosError) {
          parseAxiosError(e);
        } else {
          console.log(chalk.bgRed.white.bold(`An unknown error occured while publishing the step`));
          console.error(e);
        }
      }
    });
}
