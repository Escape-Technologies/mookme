import path from 'path';
import draftlog from 'draftlog';
import chalk from 'chalk';
import wcmatch from 'wildcard-match';
import { exec } from 'child_process';
import { StepCommand } from '../types/step.types';
import config from '../config';
import { StepUI, UIExecutionStatus } from '../display/ui';

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
    const packagePath =
      options.packageName === '__global'
        ? config.project.rootDir
        : path.join(config.project.packagesPath, options.packageName);

    if (step.onlyOn) {
      try {
        const matcher = wcmatch(step.onlyOn);

        const matched = (config.executionContext.stagedFiles || [])
          .map((fPath: string) => path.join(config.project.rootDir, fPath))
          .filter((fPath: string) => {
            return fPath.includes(packagePath);
          })
          .map((fPath: string) => fPath.replace(`${packagePath}/`, ''))
          .filter((rPath: string) => matcher(rPath));

        if (matched.length === 0) {
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

    const command =
      options.type === 'python' && options.venvActivate
        ? `source ${options.venvActivate} && ${step.command} && deactivate`
        : step.command;

    const cp = exec(command.replace('{args}', `"${args.join(' ')}"`), { cwd: packagePath });

    let out = '';
    cp.stdout?.on('data', (chunk) => {
      out += `\n${chunk}`;
    });

    let error = '';
    cp.stderr?.on('data', (chunk) => {
      error += `\n${chunk}`;
    });

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
