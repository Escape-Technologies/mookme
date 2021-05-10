import { StepCommand } from './step.types';

export enum HookType {
  preCommit = 'pre-commit',
  prepareCommit = 'prepare-commit-msg',
  commitMsg = 'commit-msg',
  postCommit = 'post-commit',
}

export const hookTypes = Object.values(HookType);

export interface PackageHook {
  name: string;
  steps: StepCommand[];
  cwd: string;
  type?: string;
  venvActivate?: string;
}
