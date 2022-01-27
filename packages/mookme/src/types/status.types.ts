/**
 * An enum denoting the different state in which a step or package item can be
 */
export enum ExecutionStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  SKIPPED = 'SKIPPED',
}
