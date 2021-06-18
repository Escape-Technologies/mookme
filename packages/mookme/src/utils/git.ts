import chalk from 'chalk';
import { execSync } from 'child_process';
import { HookType } from '../types/hook.types';
import fs from 'fs';

let hasStashed = false;

export const getNotStagedFiles = (): string[] =>
  execSync('git --no-pager diff --name-only')
    .toString()
    .split(' ')
    .map((pth) => pth.replace('\n', ''));

export const getStagedFiles = (): string[] =>
  execSync('git --no-pager diff --cached --name-only')
    .toString()
    .split(' ')
    .map((pth) => pth.replace('\n', ''));

export const stashIfNeeded = (hookType: HookType): void => {
  const shouldStash = execSync('git ls-files --others --exclude-standard --modified').toString().split('\n').length > 1;

  if (hookType === HookType.preCommit && !!shouldStash) {
    console.log(chalk.yellow.bold('Stashing unstaged changes in order to run hooks properly'));
    console.log(chalk.bold(`> git stash push --keep-index --include-untracked`));
    execSync(`git stash push --keep-index --include-untracked`).toString();

    console.log(chalk.yellow.bold('\nList of stashed and modified files:'));
    const stashedAndModified = execSync('git --no-pager stash show --name-only').toString();
    console.log(stashedAndModified);

    console.log(chalk.yellow.bold('List of stashed and untracked files:'));
    const stashedAndUntracked = execSync('git --no-pager show stash@{0}^3:').toString().split('\n').slice(2).join('\n');
    console.log(stashedAndUntracked);

    hasStashed = true;
  }
};

export const unstashIfNeeded = (hookType: HookType): void => {
  if (hookType === HookType.preCommit && hasStashed) {
    console.log();
    console.log(chalk.yellow.bold('Unstashing unstaged changes in order to run hooks properly'));
    try {
      execSync('git stash pop');
    } catch (err) {
      console.log(err);
      console.log(chalk.bgRed.white.bold('Could not unstash file ! You should run `git stash pop` and fix conflicts'));
    }
  }
};

export const hideNotCachedIfNeeded = (hookType: HookType): string | null => {
  const shouldHide = execSync('git ls-files --others --exclude-standard --modified').toString().split('\n').length > 1;
  if (hookType === HookType.preCommit && !!shouldHide) {
    const tree = execSync('git write-tree').toString().trim();
    console.log(chalk.yellow.bold('Hiding unstaged changes in order to run hooks properly'));
    console.log(chalk.bold(`> git diff-index --ignore-submodules --binary --no-color --no-ext-diff ${tree}`));

    const diffBinary = execSync(
      `git diff-index --ignore-submodules --binary --no-color --no-ext-diff ${tree}`,
    ).toString();
    const patchFilename = `patch_${Date.now()}_${process.pid}`;
    console.log(chalk.yellow.bold(`Writing patch file into ${patchFilename}`));
    fs.writeFileSync(patchFilename, diffBinary);

    console.log(chalk.yellow.bold('Cleaning work tree'));
    console.log(chalk.bold('> git checkout -- .'));
    execSync('git checkout -- .');

    return patchFilename;
  }
  return null;
};

export const unHideNotCached = (hookType: HookType, patchFilename: string): void => {
  if (hookType === HookType.preCommit) {
    try {
      const res = execSync(`git apply --whitespace=nowarn ${patchFilename}`).toString();
      console.log(res);
    } catch (error) {
      console.error(error);
      console.log(chalk.bgRed.white.bold('Could not apply patch after running hooks...'));
      console.log(chalk.bgRed.white.bold(`Restored changes from ${patchFilename}`));
    }
    fs.unlinkSync(patchFilename);
  }
};

import { ADDED_BEHAVIORS } from '../types/config.types';

export function detectAndProcessModifiedFiles(initialNotStagedFiles: string[], behavior: ADDED_BEHAVIORS): void {
  const notStagedFiles = execSync('git --no-pager diff --name-only')
    .toString()
    .split(' ')
    .map((file) => file.replace('\n', ''));

  const changedFiles = notStagedFiles.filter((file) => !initialNotStagedFiles.includes(file));
  if (changedFiles.length) {
    console.log();
    switch (behavior) {
      case ADDED_BEHAVIORS.ADD_AND_COMMIT:
        console.log(chalk.bgYellow.black('Files were changed during hook execution !'));
        console.log(chalk.yellow('Following the defined behavior : Add and continue.'));
        execSync(`git add ${process.env.ROOT_DIR}`);
        break;
      case ADDED_BEHAVIORS.EXIT:
        console.log(chalk.bgYellow.black(' Files were changed during hook execution ! '));
        console.log(chalk.yellow('Following the defined behavior : Exit.'));
        process.exit(1);
        break;
    }
  }
}
