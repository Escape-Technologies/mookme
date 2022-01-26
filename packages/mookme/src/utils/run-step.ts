import chalk from 'chalk';
import { exec } from 'child_process';
import { StepCommand } from '../types/step.types';
import config from '../config';
import { computeExecutedCommand, getMatchedFiles, resolvePackagePath } from './run-helpers';
import { bus, EventType } from '../events';

export interface RunStepOptions {
  packageName: string;
  type?: string;
  venvActivate?: string;
}

export function runStep(step: StepCommand, options: RunStepOptions): Promise<{ step: StepCommand; msg: Error } | null> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const args = config.executionContext.hookArgs!.split(' ').filter((arg) => arg !== '');
  bus.emit(EventType.StepRunning, { packageName: options.packageName, stepName: step.name });
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
          bus.emit(EventType.StepSkipped, { packageName: options.packageName, stepName: step.name });
          return resolve(null);
        }
      } catch (err) {
        bus.emit(EventType.StepFailure, { packageName: options.packageName, stepName: step.name });
        resolve({
          step,
          msg: new Error(`Invalid \`onlyOn\` pattern: ${step.onlyOn}\n${err}`),
        });
      }
    }

    const command = computeExecutedCommand(step.command, options.type, options.venvActivate);
    const cp = exec(command.replace('{args}', `"${args.join(' ')}"`), { cwd: packagePath, shell: '/bin/bash' });

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
        bus.emit(EventType.StepSuccess, { packageName: options.packageName, stepName: step.name });
        resolve(null);
      } else {
        bus.emit(EventType.StepFailure, { packageName: options.packageName, stepName: step.name });
        resolve({
          step,
          msg: new Error(error + chalk.bold('\nstdout :\n') + out),
        });
      }
    });
  });
}
