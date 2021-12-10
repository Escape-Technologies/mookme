import { StepCommand } from './step.types';

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

export const VSCSensitiveHook = [HookType.PRE_COMMIT, HookType.PREPARE_COMMIT];

export const hookTypes = Object.values(HookType);

export interface PackageHook {
  name: string;
  steps: StepCommand[];
  cwd: string;
  type?: string;
  venvActivate?: string;
}
