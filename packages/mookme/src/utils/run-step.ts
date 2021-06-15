import draftlog from 'draftlog';
import chalk from 'chalk';
import wcmatch from 'wildcard-match';
import { exec } from 'child_process';
import { StepCommand } from '../types/step.types';
import { loader } from './loader';

draftlog(console);

export interface RunStepOptions {
  name: string;
  cwd: string;
  type?: string;
  venvActivate?: string;
}

export function runStep(step: StepCommand, options: RunStepOptions): Promise<{ step: StepCommand; msg: Error } | null> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const args = process.env.MOOKME_ARGS!.split(' ').filter((arg) => arg !== '');

  return new Promise((resolve) => {
    console.log(`→ ${chalk.bold(step.name)} > ${step.command} `);

    const { logger, interval } = loader();

    if (step.onlyOn) {
      try {
        const matcher = wcmatch(step.onlyOn);

        const matched = JSON.parse(process.env.MOOKME_STAGED_FILES || '[]')
          .filter((fPath: string) => fPath.includes(options.cwd))
          .map((fPath: string) => fPath.replace(`${options.cwd}/`, ''))
          .filter((rPath: string) => matcher(rPath));

        if (matched.length === 0) {
          clearInterval(interval);
          logger(`⏩ Skipped. (no match with "${step.onlyOn}")`);
          return resolve(null);
        }
      } catch (err) {
        logger(chalk.bgRed.white.bold(' Error '));
        clearInterval(interval);
        logger('❌ Error.');
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
      clearInterval(interval);
      if (code === 0) {
        logger('✅ Done.');
        resolve(null);
      } else {
        resolve({
          step,
          msg: new Error(error + chalk.bold('\nstdout :\n') + out),
        });
        logger('❌ Error.');
      }
    });
  });
}
