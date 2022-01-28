import { ExecutionStatus } from '../types/status.types';

/**
 * The list of available event when using the `run` command
 */
export enum EventType {
  StepRegistered = 'stepRegistered',
  StepStatusChanged = 'stepStatusChanged',
  PackageRegistered = 'packageRegistered',
  PackageStatusChanged = 'packageStatusChanged',
}

interface StepRegisteredPayload {
  /**
   * The name of the package to update
   */
  packageName: string;
  /**
   * The new step to add to the package
   */
  step: { name: string; command: string };
}

interface StepStatusChangedPayload {
  /**
   * The name of the package to update
   */
  packageName: string;
  /**
   * The name of the step to update
   */
  stepName: string;
  /**
   * The new status of the step
   */
  status: ExecutionStatus;
}

interface PackageRegisteredPayload {
  /**
   * The name of the package to update
   */
  name: string;
  /**
   * The list of steps already defined in the package
   */
  steps?: { name: string; command: string }[];
}

/**
 * Map event types with their payload types
 */
export type Events = {
  [EventType.StepRegistered]: StepRegisteredPayload;
  [EventType.StepStatusChanged]: StepStatusChangedPayload;
  [EventType.PackageRegistered]: PackageRegisteredPayload;
};
