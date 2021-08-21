import chalk from 'chalk';
import { PackageHook } from '../types/hook.types';
import { runStep } from './run-step';
import { StepCommand, StepError } from '../types/step.types';
import { init_ui, UI } from '../display/ui';
import logger from '../display/logger';

function handleStepError(
  stepError: {
    step: StepCommand;
    msg: Error;
  },
  hook: PackageHook,
): StepError {
  return {
    hook,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    step: stepError!.step,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    error: stepError!.msg,
  };
}

export async function hookPackage(hook: PackageHook): Promise<StepError[]> {
  const ui: UI = init_ui(hook);

  const options = {
    packageName: hook.name,
    type: hook.type,
    venvActivate: hook.venvActivate,
  };

  const promises = [];
  const errors: { hook: PackageHook; step: StepCommand; error: Error }[] = [];

  for (const step of hook.steps) {
    try {
      const spinnerManager = ui.stepsSpinners[step.name];
      const stepPromise: Promise<{ step: StepCommand; msg: Error } | null> = runStep(step, options, spinnerManager);

      // Regardless of whether the step is serial or not, it will be awaited at the end of this function
      promises.push(stepPromise);

      if (step.serial) {
        // Serial steps are blocking
        const stepError = await stepPromise;
        const result: string = stepError == null ? chalk.bgGreen.bold(' Done ✓ ') : chalk.bgRed.bold(' Test × ');
        if (stepError !== null) {
          errors.push(handleStepError(stepError, hook));
        }
        ui.packageLogger(`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${result}`);
      } else {
        // Non-serial steps are just launched and result is processed in a callback
        stepPromise.then((stepError) => {
          const result: string = stepError == null ? chalk.bgGreen.bold(' Done ✓ ') : chalk.bgRed.bold(' Error × ');
          if (stepError !== null) {
            errors.push(handleStepError(stepError, hook));
          }
          ui.packageLogger(`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${result}`);
        });
      }
    } catch (err) {
      ui.packageLogger(`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${chalk.bgRed.bold(' Error × ')}`);
      throw err;
    }
  }

  // In every cases, we await for every step promises before processing hook results
  await Promise.all(promises);

  return errors;
}

export function processResults(results: StepError[][]): void {
  results.forEach((packageErrors) => {
    packageErrors.forEach((err) => {
      logger.failure(`\nHook of package ${err.hook.name} failed at step ${err.step.name} `);
      logger.log(err.error.message);
    });
    if (packageErrors.length > 0) {
      process.exit(1);
    }
  });
}
