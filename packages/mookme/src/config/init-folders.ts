import fs from 'fs';
import os from 'os';
import path from 'path';
import logger from '../display/logger';

function createMookmeConfigFolderIfNeeded(): void {
  const configDir = path.join(os.homedir(), '.config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }
  const mookmeConfigPath = path.join(configDir, 'mookme');
  if (!fs.existsSync(mookmeConfigPath)) {
    fs.mkdirSync(mookmeConfigPath);
  }
}

export function saveKeyInConfig(key: string): void {
  const credentialsPath = path.join(os.homedir(), '.config', 'mookme', 'credentials.json');
  logger.success('Succesfully retrieved api key. Storing it under `~/.config/mookme/credentials.json`');
  createMookmeConfigFolderIfNeeded();
  fs.writeFileSync(credentialsPath, JSON.stringify({ key }, null, 2));
  logger.success(`Credentials have been stored at path \`${credentialsPath}\``);
}

//test
