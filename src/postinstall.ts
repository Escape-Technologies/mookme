import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import { HookType } from './types/hook.types';
import { getRootDir } from './utils/get-root-dir';

const hookTypes = Object.values(HookType);
const rootDir = getRootDir();
const hooksDir = `${rootDir}/.git/hooks`;

let changed = false;
const changes: [string, string][] = [];

fs.readdirSync(hooksDir).forEach((hookType) => {
  if (hookTypes.includes(hookType as HookType)) {
    const hookFile = path.join(hooksDir, hookType);
    const script = fs.readFileSync(hookFile);
    const oldCmd = `./node_modules/@escape.tech/mookme/bin/index.js run --type ${hookType} -a "$1"`;
    if (script.includes(oldCmd)) {
      const newCmd = `./node_modules/@escape.tech/mookme/bin/index.js run --type ${hookType} --args "$1"`;
      const updated = script.toString().replace(oldCmd, newCmd);
      changed = true;
      const message = `${oldCmd}\n-> ${newCmd}`;
      changes.push([hookFile, message]);
      fs.writeFileSync(hookFile, updated);
    }
  }
});

if (changed) {
  console.log(chalk.bold.yellow(`Mookme hooks have been updated !`));
  console.log('The flag -a used currently in your hooks has been replaced by --args');
  console.log(chalk.bold('Your hook scripts will be automatically updated'));
  console.log('\nThe following file have been changed :');
  changes.forEach(([file, message]) => {
    console.log(chalk.bold(`   - ${file}`));
    console.log(message);
  });

  console.log(chalk.bgBlue.white.bold('\n Thanks for using mookme !'));
}
