export enum ADDED_BEHAVIORS {
  ADD_AND_COMMIT = 'addAndCommit',
  EXIT = 'exit',
}

export interface Config {
  packagesPath: string;
  packages: string[];
  addedBehavior: ADDED_BEHAVIORS;
}
