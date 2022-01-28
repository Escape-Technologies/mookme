import { PackageHook } from '../types/hook.types';
import { RunStepOptions, StepRunner } from '../runner/step-runner';
import { StepCommand, StepError } from '../types/step.types';
import logger from './logger';
import { bus, EventType } from '../events';
import { ExecutionStatus } from '../types/status.types';

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
  const options: RunStepOptions = {
    packageName: hook.name,
    type: hook.type,
    venvActivate: hook.venvActivate,
  };

  const promises = [];
  const errors: StepError[] = [];

  bus.emit(EventType.PackageRegistered, {
    name: hook.name,
    steps: hook.steps,
  });

  const runners = hook.steps.map((step) => new StepRunner(step, options));

  for (const stepRunner of runners) {
    const step = stepRunner.step;
    try {
      const stepPromise: Promise<{ step: StepCommand; msg: Error } | null> = stepRunner.run();

      // Regardless of whether the step is serial or not, it will be awaited at the end of this function
      promises.push(stepPromise);

      if (step.serial) {
        // Serial steps are blocking
        const stepError = await stepPromise;
        if (stepError !== null) {
          errors.push(handleStepError(stepError, hook));
        }
      } else {
        // Non-serial steps are just launched and result is processed in a callback
        stepPromise.then((stepError) => {
          if (stepError !== null) {
            errors.push(handleStepError(stepError, hook));
          }
        });
      }
    } catch (err) {
      // If this code is executed, there is some serious business going on, because the step execution is
      // supposed to be wrapped in a catch-all block
      bus.emit(EventType.StepStatusChanged, {
        packageName: hook.name,
        stepName: step.name,
        status: ExecutionStatus.FAILURE,
      });
      throw err;
    }
  }

  // Wait for the end of every step
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
