import { StepCommand } from './step.types';

/**
 * An enum of supported git hook types
 *
 */
export enum HookType {
  PRE_COMMIT = 'pre-commit',
  PREPARE_COMMIT = 'prepare-commit-msg',
  COMMIT_MSG = 'commit-msg',
  POST_COMMIT = 'post-commit',
  POST_MERGE = 'post-merge',
  POST_REWRITE = 'post-rewrite',
  PRE_REBASE = 'pre-rebase',
  POST_CHECKOUT = 'post-checkout',
  PRE_PUSH = 'pre-push',
}

/**
 * The list of hook types that should watch for modified files to add
 *
 */
export const VCSSensitiveHook = [HookType.PRE_COMMIT, HookType.PREPARE_COMMIT];

/**
 * The list of hook types
 *
 */
export const hookTypes = Object.values(HookType);

/**
 * An interface describing the package hook object used across the codebase
 *
 */

export enum PackageType {
  PYTHON = 'python',
  JS = 'js',
}
export interface PackageHook {
  /**
   * The displayed name of the package
   */
  name: string;
  /**
   * The list of step descriptors executed with the hook
   */
  steps: StepCommand[];
  /**
   * The directory where the package is stored
   */
  cwd: string;
  /**
   * The type of the hook
   */
  type?: PackageType;
  /**
   * A boolean denoting whether a virtualenv is started of not for this hook (eg for Python)
   */
  venvActivate?: string;
}
