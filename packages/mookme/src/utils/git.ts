import fs from 'fs';
import { execSync } from 'child_process';
import { HookType } from '../types/hook.types';
import { ADDED_BEHAVIORS } from '../config/types';
import logger from './logger';
import { getRootDir } from './root-dir';

import Debug from 'debug';
const debug = Debug('mookme:git');

/**
 * A helper class for performing git operations
 */
export class GitToolkit {
  /**
   * The absolute path to the root directory holding the git folder
   */
  rootDir: string;

  /**
   * constructor for the GitToolkit class
   *
   */
  constructor() {
    debug('Initializing git toolkit');
    const rootDir = getRootDir('.git');
    debug(`Found root at path ${rootDir}`);

    if (!rootDir) {
      logger.failure('Could not find a git project');
      process.exit(0);
    }
    this.rootDir = rootDir;
  }

  getNotStagedFiles(): string[] {
    debug(`getNotStagedFiles called`);
    const notStagedFiles = execSync('git diff --name-only --diff-filter=d').toString().split('\n');
    debug(`Retrieved the following files not staged: ${notStagedFiles}`);
    return notStagedFiles;
  }

  getStagedFiles(): string[] {
    debug(`getStagedFiles called`);
    const stagedFiles = execSync('git diff --cached --name-only --diff-filter=d').toString().split('\n');
    debug(`Retrieved the following files staged: ${stagedFiles}`);
    return stagedFiles;
  }

  getPreviouslyCommitedFiles(nCommitsBeforeHead = 1): string[] {
    debug(`getPreviouslyCommitedFiles(${nCommitsBeforeHead}) called`);
    const commitedFiles = execSync(`git diff-tree --no-commit-id --name-only -r HEAD~${nCommitsBeforeHead}`)
      .toString()
      .split('\n');
    debug(`Retrieved the following files commited: ${commitedFiles}`);
    return commitedFiles;
  }

  getFilesChangedBetweenRefs(from: string, to: string): string[] {
    debug(`getFilesChangedBetweenRefs(${from}, ${to}) called`);
    const changedFiles = execSync(`git diff --diff-filter=d ${from} ${to} --name-only`).toString().split('\n');

    debug(`Retrieved the following files commited: ${changedFiles}`);
    return changedFiles;
  }

  getCurrentBranchName(): string {
    return execSync('git rev-parse --abbrev-ref HEAD').toString();
  }

  getVCSState(): { staged: string[]; notStaged: string[] } {
    debug(`getVCSState called`);
    return {
      staged: this.getStagedFiles(),
      notStaged: this.getNotStagedFiles(),
    };
  }

  getAllTrackedFiles(): string[] {
    debug(`getAllTrackedFiles called`);
    return execSync('git ls-tree -r HEAD --name-only', { cwd: this.rootDir }).toString().split('\n');
  }

  getFilesToPush(): string[] {
    debug(`getFilesToPush called`);
    let commits: string[] = [];
    try {
      commits = execSync('git rev-list @{push}^..', { cwd: this.rootDir }).toString().split('\n').filter(Boolean);
    } catch (e) {
      logger.warning('Failed to retrieve the list of commits to push.');
      debug(e);
    }
    if (commits.length === 0) return [];
    return this.getFilesChangedBetweenRefs(commits[commits.length - 1], commits[0]);
  }

  detectAndProcessModifiedFiles(initialNotStagedFiles: string[], behavior: ADDED_BEHAVIORS): void {
    const notStagedFiles = this.getNotStagedFiles();
    const changedFiles = notStagedFiles.filter((file) => !initialNotStagedFiles.includes(file));
    if (changedFiles.length > 0) {
      switch (behavior) {
        case ADDED_BEHAVIORS.ADD_AND_COMMIT:
          logger.warning('Files were changed during hook execution !');
          logger.info('Following the defined behavior : Add and continue.');
          for (const file of changedFiles) {
            execSync(`git add "${this.rootDir}/${file}"`);
          }
          break;
        case ADDED_BEHAVIORS.EXIT:
          logger.warning(' Files were changed during hook execution ! ');
          logger.info('Following the defined behavior : Exit.');
          process.exit(1);
      }
    }
  }

  writeGitHooksFiles(hookTypes: HookType[]): void {
    const gitFolderPath = `${this.rootDir}/.git`;
    if (!fs.existsSync(`${gitFolderPath}/hooks`)) {
      fs.mkdirSync(`${gitFolderPath}/hooks`);
    }

    logger.info('Writing Git hooks files');

    hookTypes.forEach((type) => {
      logger.info(`- ${gitFolderPath}/hooks/${type}`);
      const mookmeCmd = `npx @escape.tech/mookme run --type ${type} --args "$1"`;
      if (fs.existsSync(`${gitFolderPath}/hooks/${type}`)) {
        const hook = fs.readFileSync(`${gitFolderPath}/hooks/${type}`).toString();
        if (!hook.includes(mookmeCmd)) {
          fs.appendFileSync(`${gitFolderPath}/hooks/${type}`, `\n${mookmeCmd}`, { flag: 'a+', mode: 0o0755 });
        } else {
          logger.log(`Hook ${type} is already declared, skipping...`);
        }
      } else {
        logger.warning(`Hook ${type} does not exist, creating file...`);
        fs.appendFileSync(`${gitFolderPath}/hooks/${type}`, `#!/bin/bash\n${mookmeCmd}`, { flag: 'a+', mode: 0o0755 });
      }
    });
  }

  writeGitIgnoreFiles(hookTypes: HookType[]): void {
    logger.info('Writing `.gitignore files`');

    const root = this.rootDir;
    const lines = hookTypes.map((t) => `.hooks/${t}.local.json`);

    if (!fs.existsSync(`${root}/.gitignore`)) {
      logger.warning(`Project root has no \`.gitignore\` file, creating it...`);
      fs.writeFileSync(`${root}/.gitignore`, lines.join('\n'));
    } else {
      const gitignoreContent = fs.readFileSync(`${root}/.gitignore`).toString();
      for (const line of lines) {
        if (gitignoreContent.includes(line)) {
          fs.appendFileSync(`${root}/.gitignore`, `\n.${line}n\n`, { flag: 'a+' });
        }
      }
    }
  }
}
