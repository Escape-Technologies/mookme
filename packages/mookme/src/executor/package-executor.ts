import { PackageHook } from '../types/hook.types';
import { ExecuteStepOptions, StepExecutor } from './step-executor';
import { StepCommand, StepError } from '../types/step.types';
import { bus, EventType } from '../events';
import { ExecutionStatus } from '../types/status.types';

/**
 * A class for handling the hook execution for a package. It runs it's steps and process their results
 */
export class PackageExecutor {
  /**
   * The package object being used for executing the steps
   */
  package: PackageHook;
  /**
   * The set of options retrieved from the package, and being passed to the step for their own execution
   */
  options: ExecuteStepOptions;
  /**
   * The list of step executors attached to this package's steps
   */
  stepExecutors: StepExecutor[];

  constructor(pkg: PackageHook) {
    this.package = pkg;
    this.options = {
      packageName: pkg.name,
      type: pkg.type,
      venvActivate: pkg.venvActivate,
    };
    this.stepExecutors = pkg.steps.map((step) => new StepExecutor(step, this.options));

    // Notify the application that this package is being hooked
    bus.emit(EventType.PackageRegistered, {
      name: this.package.name,
      steps: this.package.steps,
    });
  }

  /**
   * Run asynchronously every steps of the package attached to this executor.
   *
   * @returns A promised list containing every errors that occured during the package's steps
   */
  async executePackageSteps(): Promise<StepError[]> {
    const promises = [];
    const errors: StepError[] = [];

    for (const executor of this.stepExecutors) {
      const step = executor.step;
      try {
        // Start the step
        const stepPromise: Promise<{ step: StepCommand; msg: Error } | null> = executor.run();

        // Regardless of whether the step is serial or not, it will be awaited at the end of this function
        promises.push(stepPromise);

        if (step.serial) {
          // Serial steps are blocking
          const stepError = await stepPromise;
          if (stepError !== null) {
            errors.push({
              hook: this.package,
              step: stepError.step,
              error: stepError.msg,
            });
          }
        } else {
          // Non-serial steps are just launched and result is processed in a callback
          stepPromise.then((stepError) => {
            if (stepError !== null) {
              errors.push({
                hook: this.package,
                step: stepError.step,
                error: stepError.msg,
              });
            }
          });
        }
      } catch (err) {
        // If this code is executed, there is some serious business going on, because the step execution is
        // supposed to be wrapped in a catch-all block
        bus.emit(EventType.StepStatusChanged, {
          packageName: this.package.name,
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
}
