import path from 'path';
import { PackageHook } from '../../types/hook.types';
import { GitToolkit } from '../../utils/git';
import { FilterStrategy } from './base-filter';

/**
 * Filter a list of packages based on the VCS state, and the staged files it holds.
 */
export class CurrentCommitFilterStrategy extends FilterStrategy {
  gitToolkit: GitToolkit;

  /**
   * @param gitToolkit - the {@link GitToolkit} instance to use to manage the VCS state
   */
  constructor(gitToolkit: GitToolkit) {
    super();
    this.gitToolkit = gitToolkit;
  }

  matchExactPath(filePath: string, to_match: string): boolean {
    const position = filePath.indexOf(to_match);
    if (position === -1) {
      return false;
    }
    const remainingPath = filePath.slice(position + to_match.length);
    return remainingPath.length > 0 ? remainingPath.startsWith('/') : true;
  }

  /**
   * Filter a list of packages based on the VCS state, and the staged files it holds.
   * @param hooks - the list of {@link PackageHook} to filter
   * @returns the filtered list of {@link PackageHook} based on their consistency with the files staged in VCS.
   */
  async filter(hooks: PackageHook[]): Promise<PackageHook[]> {
    const { staged: stagedFiles } = this.gitToolkit.getVCSState();

    const filtered = hooks.filter((hook) => {
      return !!stagedFiles.find((file) => this.matchExactPath(path.join(this.gitToolkit.rootDir, file), hook.cwd));
    });

    return filtered;
  }
}
