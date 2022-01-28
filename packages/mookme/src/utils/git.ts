import fs from 'fs';
import { execSync } from 'child_process';
import { HookType } from '../types/hook.types';
import { ADDED_BEHAVIORS } from '../config/types';
import logger from './logger';
import { getRootDir } from './root-dir';

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
    const rootDir = getRootDir('.git');
    if (!rootDir) {
      logger.failure('Could not find a git project');
      process.exit(0);
    }
    logger.success(`Git folder found at path ${rootDir}`);
    this.rootDir = rootDir;
  }

  getNotStagedFiles(): string[] {
    return execSync('echo $(git diff --name-only)')
      .toString()
      .split(' ')
      .map((pth) => pth.replace('\n', ''));
  }

  getStagedFiles(): string[] {
    return execSync('echo $(git diff --cached --name-only)')
      .toString()
      .split(' ')
      .map((pth) => pth.replace('\n', ''));
  }

  getVCSState(): { staged: string[]; notStaged: string[] } {
    return {
      staged: this.getStagedFiles(),
      notStaged: this.getNotStagedFiles(),
    };
  }

  detectAndProcessModifiedFiles(initialNotStagedFiles: string[], behavior: ADDED_BEHAVIORS): void {
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
            execSync(`git add ${this.rootDir}/${file}`);
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
      const mookmeLegacyCmd = `./node_modules/@escape.tech/mookme/bin/index.js run --type ${type} --args "$1"`;
      const mookmeCmd = `npx mookme run --type ${type} --args "$1"`;
      if (fs.existsSync(`${gitFolderPath}/hooks/${type}`)) {
        const hook = fs.readFileSync(`${gitFolderPath}/hooks/${type}`).toString();
        if (hook.includes(mookmeLegacyCmd)) {
          logger.log(`Legacy mookme invokation detected, updating it...`);
          const newHook = hook.replace(mookmeLegacyCmd, mookmeCmd);
          fs.writeFileSync(`${gitFolderPath}/hooks/${type}`, newHook);
          execSync(`chmod +x ${gitFolderPath}/hooks/${type}`);
        } else if (!hook.includes(mookmeCmd)) {
          fs.appendFileSync(`${gitFolderPath}/hooks/${type}`, `\n${mookmeCmd}`, { flag: 'a+' });
          execSync(`chmod +x ${gitFolderPath}/hooks/${type}`);
        } else {
          logger.log(`Hook ${type} is already declared, skipping...`);
        }
      } else {
        logger.warning(`Hook ${type} does not exist, creating file...`);
        fs.appendFileSync(`${gitFolderPath}/hooks/${type}`, `#!/bin/bash\n${mookmeCmd}`, { flag: 'a+' });
        execSync(`chmod +x ${gitFolderPath}/hooks/${type}`);
      }
    });
  }

  writeGitIgnoreFiles(packagesPath: string[]): void {
    logger.info('Writing `.gitignore files`');

    for (const pkgPath of packagesPath) {
      logger.info(`- ${pkgPath}`);
      if (!fs.existsSync(`${pkgPath}/.gitignore`)) {
        logger.warning(`Package ${pkgPath} has no \`.gitignore\` file, creating it...`);
        fs.writeFileSync(`${pkgPath}/.gitignore`, `.hooks/*.local.json\n`);
      } else {
        const line = '.hooks/*.local.json';
        const gitignoreContent = fs.readFileSync(`${pkgPath}/.gitignore`).toString();
        if (gitignoreContent.includes(line)) {
          fs.appendFileSync(`${pkgPath}/.gitignore`, `\n.hooks/*.local.json\n`, { flag: 'a+' });
        }
      }
    }
  }
}
