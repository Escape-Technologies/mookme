import draftlog from 'draftlog';
import chalk from 'chalk';
import { PackageHook } from '../types/hook.types';
import { runStep } from './run-step';
import { StepCommand } from '../types/step.types';

draftlog(console);

export function hookPackage(hook: PackageHook): Promise<{ hook: PackageHook; step: StepCommand; msg: Error }[]> {
  const loggers: { [key: string]: (log: string) => void } = {};
  loggers[hook.name] = console.draft(
    `${chalk.bold.inverse(` Hooks : ${hook.name} `)}${chalk.bgBlueBright.bold(' Running... ')}`,
  );

  const options = {
    name: hook.name,
    cwd: hook.cwd,
    type: hook.type,
    venvActivate: hook.venvActivate,
  };

  return new Promise((resolve, reject) =>
    Promise.all(hook.steps.map((step) => runStep(step, options)))
      .then((errors) => {
        const hasError = errors.find((err) => err !== null);
        const result = hasError ? chalk.bgRed.bold(' Error × ') : chalk.bgGreen.bold(' Done ✓ ');
        loggers[hook.name](`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${result}`);
        resolve(
          errors
            .filter((err) => err !== null)
            .map((err) => ({
              hook,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              step: err!.step,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              msg: err!.msg,
            })),
        );
      })
      .catch((err) => {
        loggers[hook.name](`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${chalk.bgRed.bold(' Error × ')}`);
        reject(err);
      }),
  );
}
