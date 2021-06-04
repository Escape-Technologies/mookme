import { PackageHook } from './hook.types';

export interface StepCommand {
  name: string;
  command: string;
  onlyOn?: string;
}

export interface StepError {
  hook: PackageHook;
  step: StepCommand;
  msg: Error;
}
