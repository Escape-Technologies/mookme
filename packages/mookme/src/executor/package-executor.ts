import { PackageHook } from '../types/hook.types';
import { StepExecutor } from './step-executor';
import { StepCommand, StepError } from '../types/step.types';
import { bus, EventType } from '../events';
import { ExecutionStatus } from '../types/status.types';

export interface PackageExecutorOptions {
  /**
   * The arguments provided to the git hooks command
   */
  hookArguments: string;
  /**
   * The list of staged files in the current copy
   */
  stagedFiles: string[];
  /**
   * The absolute path pointing towards the root directory
   */
  rootDir: string;
}

/**
 * A class for handling the hook execution for a package. It runs it's steps and process their results
 */
export class PackageExecutor {
  /**
   * The package object being used for executing the steps
   */
  package: PackageHook;
  /**
   * The list of step executors attached to this package's steps
   */
  stepExecutors: StepExecutor[];

  options: PackageExecutorOptions;

  constructor(pkg: PackageHook, options: PackageExecutorOptions) {
    this.package = pkg;
    this.options = options;
    this.stepExecutors = pkg.steps.map(
      (step) =>
        new StepExecutor(step, {
          packageName: pkg.name,
          packagePath: pkg.cwd,
          type: pkg.type,
          venvActivate: pkg.venvActivate,
          hookArguments: options.hookArguments,
          stagedFiles: options.stagedFiles,
          rootDir: options.rootDir,
        }),
    );

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
