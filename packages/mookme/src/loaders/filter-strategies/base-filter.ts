import Debug from 'debug';
import path from 'path';
import { PackageHook, UnprocessedPackageHook } from '../../types/hook.types';
import { GitToolkit } from '../../utils/git';

const debug = Debug('mookme:filtering-strategy');

/**
 * A base class for denoting a strategy used to filter hooks to run
 */
export abstract class FilterStrategy {
  gitToolkit: GitToolkit;

  constructor(gitToolkit: GitToolkit) {
    this.gitToolkit = gitToolkit;
  }

  abstract geFilesPathList(): string[];

  matchExactPath(filePath: string, to_match: string): boolean {
    const position = filePath.indexOf(to_match);
    if (position === -1) {
      return false;
    }
    const remainingPath = filePath.slice(position + to_match.length);
    return remainingPath.length > 0 ? remainingPath.startsWith('/') : true;
  }

  /**
   * Filter a list of packages based on a list of files path relative from the git root directory.
   * @param hooks - the list of {@link PackageHook} to filter
   * @returns the filtered list of {@link PackageHook} based on their consistency with the files staged in VCS.
   */
  async filter(hooks: UnprocessedPackageHook[]): Promise<PackageHook[]> {
    const filesPathList = this.geFilesPathList();

    const filtered: PackageHook[] = [];

    for (const unprocessedHook of hooks) {
      // Detect if the current commit includes files concerning this hook
      const matchedFiles = filesPathList.filter((file) =>
        this.matchExactPath(path.join(this.gitToolkit.rootDir, file), unprocessedHook.cwd),
      );
      if (matchedFiles.length > 0) {
        debug(`Adding ${unprocessedHook.name} because there are ${matchedFiles.length} files matching it's path`);
        // Include the matched files in the hook and it's steps
        filtered.push({
          ...unprocessedHook,
          steps: unprocessedHook.steps.map((step) => ({
            ...step,
            // Make the step matched paths relative to the cwd of the package they belong to
            matchedFiles: matchedFiles.map((fPath) =>
              path.join(this.gitToolkit.rootDir, fPath).replace(`${unprocessedHook.cwd}/`, ''),
            ),
          })),
          matchedFiles,
        });
      } else {
        debug(`Skipping hook ${unprocessedHook.name} because there are no match between it's path and staged files`);
      }
    }

    return filtered;
  }
}
