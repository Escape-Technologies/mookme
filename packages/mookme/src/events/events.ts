/**
 * The list of available event when using the `run` command
 */
export enum EventType {
  StepRegistered = 'stepRegistered',
  StepRunning = 'stepRunning',
  StepSuccess = 'stepSuccess',
  StepFailure = 'stepFailure',
  StepSkipped = 'stepSkipped',
  PackageRegistered = 'packageRegistered',
  PackageRunning = 'packageRunning',
  PackageSuccess = 'packageSuccess',
  PackageFailure = 'packageFailure',
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

interface StepStateChangedPayload {
  /**
   * The name of the package to update
   */
  packageName: string;
  /**
   * The name of the step to update
   */
  stepName: string;
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

interface PackageStateChangedPayload {
  /**
   * The name of the package to update
   */
  name: string;
}

/**
 * Map event types with their payload types
 */
export type Events = {
  [EventType.StepRegistered]: StepRegisteredPayload;
  [EventType.StepRunning]: StepStateChangedPayload;
  [EventType.StepSuccess]: StepStateChangedPayload;
  [EventType.StepFailure]: StepStateChangedPayload;
  [EventType.StepSkipped]: StepStateChangedPayload;
  [EventType.PackageRegistered]: PackageRegisteredPayload;
  [EventType.PackageRunning]: PackageStateChangedPayload;
  [EventType.PackageSuccess]: PackageStateChangedPayload;
  [EventType.PackageFailure]: PackageStateChangedPayload;
};
