export enum ADDED_BEHAVIORS {
  ADD_AND_COMMIT = 'addAndCommit',
  EXIT = 'exit',
}

export interface ProjectConfig {
  packagesPath: string;
  packages: string[];
  addedBehavior: ADDED_BEHAVIORS;
}

export interface CLIConfig {
  backendUrl: string;
}

export interface AuthConfig {
  key: string;
}
