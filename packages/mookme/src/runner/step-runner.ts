import chalk from 'chalk';
import { exec } from 'child_process';
import path from 'path';
import config from '../config';
import { bus, EventType } from '../events';
import { PackageType } from '../types/hook.types';
import { ExecutionStatus } from '../types/status.types';
import { StepCommand } from '../types/step.types';
import { getMatchedFiles } from '../utils/run-helpers';

export interface RunStepOptions {
  /**
   * The name of the package using this step
   */
  packageName: string;
  /**
   * The type of the step to run.
   */
  type?: PackageType;
  /**
   * An optional to a virtualenv to use (only used if type is {@link PackageType.PYTHON}
   */
  venvActivate?: string;
}

/**
 * A class responsible for running a step in a separate child process.
 *
 * It handles eventual error from the child process and return the exit code
 */
export class StepRunner {
  /**
   * The step object representing the task to run
   */
  step: StepCommand;
  /**
   * Runner options, see {@link RunStepOptions}
   */
  options: RunStepOptions;
  /**
   * The absolute path to the step's package
   */
  packagePath: string;
  /**
   * A boolean denoting if the step should be skipped. Computed during instanciation or with {@link StepRunner.isSkipped}
   */
  skipped = false;

  /**
   *
   * @param step - The step object representing the task to run
   * @param options - Runner options, see {@link RunStepOptions}
   * @param config - A config object, the global Mookme config by default. Can be replaced for testing purposes
   * @param bus - An event bus object, the global Mookme event bus by default. Can be replaced for testing purposes
   */
  constructor(step: StepCommand, options: RunStepOptions) {
    this.step = step;
    this.options = options;

    // Compute the absolute path to the package. Defaults to rootDir for global steps
    const { rootDir, packagesPath } = config.project;
    const { packageName } = this.options;
    this.packagePath = packageName === '__global' ? rootDir : path.join(packagesPath, packageName);

    // Determine if step is skipped
    this.skipped = this.isSkipped();
  }

  /**
   * // Determine if the step is skipped
   * @returns true if {@link StepCommand.onlyOn} is not set, otherwise true is a changed file of the package matches the pattern, otherwise false
   */
  isSkipped(): boolean {
    if (this.step.onlyOn) {
      try {
        const matchedFiles = getMatchedFiles(
          this.step.onlyOn,
          this.packagePath,
          config.executionContext.stagedFiles,
          config.project.rootDir,
        );
        if (matchedFiles.length === 0) {
          return true;
        }
        return false;
      } catch (err) {
        throw new Error(`Invalid \`onlyOn\` pattern: ${this.step.onlyOn}\n${err}`);
      }
    }
    return false;
  }

  /**
   * Notify the application that a step has a new status
   *
   * @param status - the new status of the step
   */
  emitStepStatus(status: ExecutionStatus): void {
    bus.emit(EventType.StepStatusChanged, {
      packageName: this.options.packageName,
      stepName: this.step.name,
      status,
    });
  }

  /**
   * Compute the command associated with the step
   *
   * @returns the full command to pass to a child process
   */
  computeExecutedCommand(): string {
    // Add eventual virtual env to activate before the command
    const { type, venvActivate } = this.options;
    const { command } = this.step;
    const execute = type === 'python' && venvActivate ? `source ${venvActivate} && ${command} && deactivate` : command;

    // Perform the args interpolation
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const args = config.executionContext.hookArgs!.split(' ').filter((arg) => arg !== '');
    execute.replace('{args}', `"${args.join(' ')}"`);
    return execute;
  }

  /**
   * Start the step execution, and process it's result
   *
   * @returns a promise, containing eithor nothing (null) if the execution is succesful, or an error if it failed
   */
  run(): Promise<{ step: StepCommand; msg: Error } | null> {
    this.emitStepStatus(ExecutionStatus.RUNNING);

    if (this.skipped) {
      this.emitStepStatus(ExecutionStatus.SKIPPED);
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const command = this.computeExecutedCommand();
      const cp = exec(command, { cwd: this.packagePath, shell: '/bin/bash' });

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
          this.emitStepStatus(ExecutionStatus.SUCCESS);
          resolve(null);
        } else {
          this.emitStepStatus(ExecutionStatus.FAILURE);
          resolve({
            step: this.step,
            msg: new Error(error + chalk.bold('\nstdout :\n') + out),
          });
        }
      });
    });
  }
}
