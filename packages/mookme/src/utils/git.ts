import fs from 'fs';
import { execSync } from 'child_process';
import { HookType, hookTypes } from '../types/hook.types';
import { ADDED_BEHAVIORS } from '../config/types';
import config from '../config';
import logger from '../display/logger';

let hasStashed = false;

export const getNotStagedFiles = (): string[] =>
  execSync('echo $(git diff --name-only)')
    .toString()
    .split(' ')
    .map((pth) => pth.replace('\n', ''));

export const getStagedFiles = (): string[] =>
  execSync('echo $(git diff --cached --name-only)')
    .toString()
    .split(' ')
    .map((pth) => pth.replace('\n', ''));

export const stashIfNeeded = (hookType: HookType): void => {
  const shouldStash = execSync('git ls-files --others --exclude-standard --modified').toString().split('\n').length > 1;

  if (hookType === HookType.preCommit && !!shouldStash) {
    logger.warning('Stashing unstaged changes in order to run hooks properly');
    logger.info(`> git stash push --keep-index --include-untracked`);
    execSync(`git stash push --keep-index --include-untracked`).toString();

    logger.warning('\nList of stashed and modified files:');
    const stashedAndModified = execSync('git --no-pager stash show --name-only').toString();
    logger.log(stashedAndModified);

    logger.warning('List of stashed and untracked files:');
    const stashedAndUntracked = execSync('git --no-pager show stash@{0}^3:').toString().split('\n').slice(2).join('\n');
    logger.log(stashedAndUntracked);

    hasStashed = true;
  }
};

export const unstashIfNeeded = (hookType: HookType): void => {
  if (hookType === HookType.preCommit && hasStashed) {
    console.log();
    logger.warning('Unstashing unstaged changes in order to run hooks properly');
    try {
      execSync('git stash pop');
    } catch (err) {
      logger.failure('Could not unstash file ! You should run `git stash pop` and fix conflicts');
      console.error(err);
    }
  }
};

export function detectAndProcessModifiedFiles(initialNotStagedFiles: string[], behavior: ADDED_BEHAVIORS): void {
  const { rootDir } = config.project;
  const notStagedFiles = execSync('echo $(git diff --name-only)')
    .toString()
    .split(' ')
    .map((file) => file.replace('\n', ''));

  const changedFiles = notStagedFiles.filter((file) => !initialNotStagedFiles.includes(file));
  if (changedFiles.length) {
    console.log();
    switch (behavior) {
      case ADDED_BEHAVIORS.ADD_AND_COMMIT:
        logger.warning('Files were changed during hook execution !');
        logger.info('Following the defined behavior : Add and continue.');
        for (const file of changedFiles) {
          execSync(`git add ${rootDir}/${file}`);
        }
        break;
      case ADDED_BEHAVIORS.EXIT:
        logger.warning(' Files were changed during hook execution ! ');
        logger.info('Following the defined behavior : Exit.');
        process.exit(1);
    }
  }
}

export function writeGitHooksFiles(): void {
  if (!fs.existsSync('./.git/hooks')) {
    fs.mkdirSync('./.git/hooks');
  }

  logger.info('Writing Git hooks files');

  hookTypes.forEach((type) => {
    logger.info(`- ./.git/hooks/${type}`);
    const mookmeCmd = `./node_modules/@escape.tech/mookme/bin/index.js run --type ${type} --args "$1"`;
    if (fs.existsSync(`./.git/hooks/${type}`)) {
      const hook = fs.readFileSync(`./.git/hooks/${type}`).toString();
      if (!hook.includes(mookmeCmd)) {
        fs.appendFileSync(`./.git/hooks/${type}`, `\n${mookmeCmd}`, { flag: 'a+' });
        execSync(`chmod +x ./.git/hooks/${type}`);
      } else {
        logger.log(`Hook ${type} is already declared, skipping...`);
      }
    } else {
      logger.warning(`Hook ${type} does not exist, creating file...`);
      fs.appendFileSync(`./.git/hooks/${type}`, `#!/bin/bash\n${mookmeCmd}`, { flag: 'a+' });
      execSync(`chmod +x ./.git/hooks/${type}`);
    }
  });
}
