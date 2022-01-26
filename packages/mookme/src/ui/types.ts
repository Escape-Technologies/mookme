/**
 * An enum denoting the different state in which a UI item can be
 */
export enum UIExecutionStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  SKIPPED = 'SKIPPED',
}

/**
 * An interface for the representation of a step in the UI
 */
export interface UIStepItem {
  /**
   * Displayed name of the step, also used for indexing
   */
  name: string;
  /**
   * The command executed in this step
   */
  command: string;
  /**
   * The current status of the step
   */
  status: UIExecutionStatus;
}

/**
 * An interface for the representation of a package in the UI
 */
export interface UIPackageItem {
  /**
   * Displayed name of the package, also used for indexing
   */
  name: string;
  /**
   * The current status of the package. Mostly computed from it's steps.
   */
  status: UIExecutionStatus;
  /**
   * The list of steps used by the package
   */
  steps: UIStepItem[];
}
