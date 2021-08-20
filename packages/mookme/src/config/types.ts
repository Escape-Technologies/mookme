import { HookType } from '../types/hook.types';

export enum ADDED_BEHAVIORS {
  ADD_AND_COMMIT = 'addAndCommit',
  EXIT = 'exit',
}

export interface ProjectConfig {
  packagesPath: string;
  packages: string[];
  addedBehavior: ADDED_BEHAVIORS;
  rootDir: string;
}

export interface CLIConfig {
  backendUrl: string;
}

export interface AuthConfig {
  key: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PkgJSON = { [key: string]: any };

export interface MookmeConfig {
  project: ProjectConfig;
  cli: CLIConfig;
  auth: AuthConfig;
  packageJSON: PkgJSON;
}

export interface ExecutionContext {
  hookArgs?: string;
  stagedFiles?: string[];
  hookType?: HookType;
}
