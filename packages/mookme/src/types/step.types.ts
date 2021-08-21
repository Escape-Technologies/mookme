import { PackageHook } from './hook.types';

export interface StepCommand {
  name: string;
  command: string;
  onlyOn?: string;
  serial?: boolean;
}

export interface StepError {
  hook: PackageHook;
  step: StepCommand;
  error: Error;
}
