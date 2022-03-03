import draftlog from 'draftlog';
import chalk from 'chalk';
import { exec } from 'child_process';
import { StepCommand } from '../types/step.types';
import config from '../config';
import { StepUI, UIExecutionStatus } from '../display/ui';
import { computeExecutedCommand, getMatchedFiles, resolvePackagePath } from './run-helpers';

draftlog(console);

export interface RunStepOptions {
  packageName: string;
  type?: string;
  venvActivate?: string;
}

export function runStep(
  step: StepCommand,
  options: RunStepOptions,
  stepUI: StepUI,
): Promise<{ step: StepCommand; msg: Error } | null> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const args = config.executionContext.hookArgs!.split(' ').filter((arg) => arg !== '');
  stepUI.setStatus(UIExecutionStatus.RUNNING);
  return new Promise((resolve) => {
    const packagePath = resolvePackagePath(config.project.rootDir, config.project.packagesPath, options.packageName);

    if (step.onlyOn) {
      try {
        const matchedFiles = getMatchedFiles(
          step.onlyOn,
          packagePath,
          config.executionContext.stagedFiles,
          config.project.rootDir,
        );
        if (matchedFiles.length === 0) {
          stepUI.stop(`⏩ Skipped. (no match with "${step.onlyOn}")`);
          return resolve(null);
        }
      } catch (err) {
        stepUI.stop('❌ Error.');
        resolve({
          step,
          msg: new Error(`Invalid \`onlyOn\` pattern: ${step.onlyOn}\n${err}`),
        });
      }
    }

    const command = computeExecutedCommand(step.command, options.type, options.venvActivate);
    const cp = exec(command.replace('{args}', `"${args.join(' ')}"`), { cwd: packagePath });

    /* handle command outputs */
    let out = '';
    cp.stdout?.on('data', (chunk) => {
      out += `\n${chunk}`;
    });

    let error = '';
    cp.stderr?.on('data', (chunk) => {
      error += `\n${chunk}`;
    });

    /* handle command success or failure */
    cp.on('exit', (code) => {
      if (code === 0) {
        stepUI.stop('✅ Done.');
        resolve(null);
      } else {
        resolve({
          step,
          msg: new Error(error + chalk.bold('\nstdout :\n') + out),
        });
        stepUI.stop('❌ Error.');
      }
    });
  });
}
