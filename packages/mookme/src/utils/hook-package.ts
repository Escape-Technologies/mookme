import draftlog from 'draftlog';
import chalk from 'chalk';
import { PackageHook } from '../types/hook.types';
import { runStep } from './run-step';
import { StepCommand, StepError } from '../types/step.types';
import { loader } from './loader';

draftlog(console);

type Logger = (log: string) => void;
interface UI {
  packageLogger: Logger;
  stepsLoggers: { [key: string]: { logger: Logger; interval: NodeJS.Timeout } };
}

function init_ui(hook: PackageHook): UI {
  const ui: UI = {
    packageLogger: console.draft(
      `${chalk.bold.inverse(` Hooks : ${hook.name} `)}${chalk.bgBlueBright.bold(' Running... ')}`,
    ),
    stepsLoggers: {},
  };
  console.log();

  for (const step of hook.steps) {
    console.log(`→ ${chalk.bold(step.name)} > ${step.command} `);
    ui.stepsLoggers[step.name] = loader();
  }

  return ui;
}

export async function hookPackage(hook: PackageHook): Promise<{ hook: PackageHook; step: StepCommand; msg: Error }[]> {
  const ui: UI = init_ui(hook);

  const options = {
    name: hook.name,
    cwd: hook.cwd,
    type: hook.type,
    venvActivate: hook.venvActivate,
  };

  const promises = [];
  const errors: { hook: PackageHook; step: StepCommand; msg: Error }[] = [];

  for (const step of hook.steps) {
    try {
      const { logger, interval } = ui.stepsLoggers[step.name];
      const stepPromise = runStep(step, options, logger, interval);
      promises.push(stepPromise);

      if (step.serial) {
        const stepError = await stepPromise;
        let result: string = chalk.bgGreen.bold(' Done ✓ ');
        if (stepError !== null) {
          result = chalk.bgRed.bold(' Error × ');
          errors.push({
            hook,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            step: stepError!.step,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            msg: stepError!.msg,
          });
        }
        ui.packageLogger(`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${result}`);
      } else {
        stepPromise.then((stepError) => {
          let result: string = chalk.bgGreen.bold(' Done ✓ ');
          if (stepError !== null) {
            result = chalk.bgRed.bold(' Error × ');
            errors.push({
              hook,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              step: stepError!.step,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              msg: stepError!.msg,
            });
          }
          ui.packageLogger(`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${result}`);
        });
      }
    } catch (err) {
      ui.packageLogger(`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${chalk.bgRed.bold(' Error × ')}`);
      throw err;
    }
  }

  await Promise.all(promises);

  return errors;

  // return await new Promise((resolve, reject) =>
  //   Promise.all(hook.steps.map((step) => runStep(step, options)))
  //     .then((errors) => {
  //       const hasError = errors.find((err) => err !== null);
  //       const result = hasError ? chalk.bgRed.bold(' Failed × ') : chalk.bgGreen.bold(' Success ✓ ');
  //       loggers[hook.name](`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${result}`);
  //       resolve(
  //         errors
  //           .filter((err) => err !== null)
  //           .map((err) => ({
  //             hook,
  //             // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //             step: err!.step,
  //             // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //             msg: err!.msg,
  //           })),
  //       );
  //     })
  //     .catch((err) => {
  //       loggers[hook.name](`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${chalk.bgRed.bold(' Error × ')}`);
  //       reject(err);
  //     }),
  // );
}

export function processResults(results: StepError[][]): void {
  results.forEach((packageErrors) => {
    packageErrors.forEach((err) => {
      console.log(chalk.bgRed.white.bold(`\n Hook of package ${err.hook.name} failed at step ${err.step.name} `));
      console.log(chalk.red(err.msg));
    });
    if (packageErrors.length > 0) {
      process.exit(1);
    }
  });
}
