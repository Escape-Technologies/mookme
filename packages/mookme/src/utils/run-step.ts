import draftlog from 'draftlog';
import chalk from 'chalk';
import wcmatch from 'wildcard-match';
import { exec } from 'child_process';
import { StepCommand } from '../types/step.types';
import { SpinnerManager } from './spinner';
import config from '../config';

draftlog(console);

export interface RunStepOptions {
  name: string;
  cwd: string;
  type?: string;
  venvActivate?: string;
}

export function runStep(
  step: StepCommand,
  options: RunStepOptions,
  spinnerManager: SpinnerManager,
): Promise<{ step: StepCommand; msg: Error } | null> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const args = config.executionContext.hookArgs!.split(' ').filter((arg) => arg !== '');
  spinnerManager.updateMessage('Running');
  return new Promise((resolve) => {
    if (step.onlyOn) {
      try {
        const matcher = wcmatch(step.onlyOn);

        const matched = JSON.parse(process.env.MOOKME_STAGED_FILES || '[]')
          .filter((fPath: string) => fPath.includes(options.cwd))
          .map((fPath: string) => fPath.replace(`${options.cwd}/`, ''))
          .filter((rPath: string) => matcher(rPath));

        if (matched.length === 0) {
          clearInterval(spinnerManager.interval);
          spinnerManager.display(`⏩ Skipped. (no match with "${step.onlyOn}")`);
          return resolve(null);
        }
      } catch (err) {
        spinnerManager.display(chalk.bgRed.white.bold(' Error '));
        clearInterval(spinnerManager.interval);
        spinnerManager.display('❌ Error.');
        resolve({
          step,
          msg: new Error(`Invalid \`onlyOn\` pattern: ${step.onlyOn}\n${err}`),
        });
      }
    }

    const command =
      options.type === 'python' && options.venvActivate
        ? `source ${options.venvActivate} && ${step.command}&& deactivate`
        : step.command;

    const cp = exec(command.replace('{args}', `"${args.join(' ')}"`), { cwd: options.cwd, shell: '/bin/bash' });

    let out = '';
    cp.stdout?.on('data', (chunk) => {
      out += `\n${chunk}`;
    });

    let error = '';
    cp.stderr?.on('data', (chunk) => {
      error += `\n${chunk}`;
    });

    cp.on('exit', (code) => {
      clearInterval(spinnerManager.interval);
      if (code === 0) {
        spinnerManager.display('✅ Done.');
        resolve(null);
      } else {
        resolve({
          step,
          msg: new Error(error + chalk.bold('\nstdout :\n') + out),
        });
        spinnerManager.display('❌ Error.');
      }
    });
  });
}
