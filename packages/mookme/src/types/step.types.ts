import { PackageHook } from './hook.types';

/**
 * An interface describing the step object used across the codebase
 *
 */
export interface UnprocessedStepCommand {
  /**
   *  The named of the step. Displayed in the UI and used in it to index steps and hooks
   */
  name: string;
  /**
   *  The command that will be invoked in `execSync`
   */
  command: string;
  /**
   *  A pattern string describing which changed files will trigger this step
   */
  onlyOn?: string;
  /**
   *  Should this step be awaited before starting the next one
   */
  serial?: boolean;
  /**
   *  Does this step extend a shared step
   */
  from?: string;
}

export interface StepCommand extends UnprocessedStepCommand {
  matchedFiles: string[];
}

/**
 * An interface describing eventual errors throws in the step executor
 *
 */
export interface StepError {
  /**
   *  The hook where the error occured
   */
  hook: PackageHook;
  /**
   *  The step of the hook where the error occured
   */
  step: StepCommand;
  /**
   *  The actual error
   */
  error: Error;
}
