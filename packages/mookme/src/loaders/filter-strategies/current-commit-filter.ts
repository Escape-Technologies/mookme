import { GitToolkit } from '../../utils/git';
import { FilterStrategy } from './base-filter';

/**
 * Filter a list of packages based on the VCS state, and the staged files it holds.
 */
export class CurrentCommitFilterStrategy extends FilterStrategy {
  useAllFiles: boolean;

  /**
   * @param gitToolkit - the {@link GitToolkit} instance to use to manage the VCS state
   */
  constructor(gitToolkit: GitToolkit, useAllFiles = false) {
    super(gitToolkit);
    this.useAllFiles = useAllFiles;
  }

  geFilesPathList(): string[] {
    return this.useAllFiles ? this.gitToolkit.getAllTrackedFiles() : this.gitToolkit.getVCSState().staged;
  }
}
