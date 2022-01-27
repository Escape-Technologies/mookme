import { ExecutionStatus } from '../types/status.types';

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
  status: ExecutionStatus;
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
  status: ExecutionStatus;
  /**
   * The list of steps used by the package
   */
  steps: UIStepItem[];
}
