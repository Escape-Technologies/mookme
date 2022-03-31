import { GitToolkit } from '../../utils/git';
import { FilterStrategy } from './base-filter';

/**
 * A base class for denoting a strategy used to filter hooks to run
 */
export class PreviousCommitFilterStrategy extends FilterStrategy {
  useAllFiles: boolean;

  /**
   * @param gitToolkit - the {@link GitToolkit} instance to use to manage the VCS state
   */
  constructor(gitToolkit: GitToolkit, useAllFiles = false) {
    super(gitToolkit);
    this.useAllFiles = useAllFiles;
  }

  geFilesPathList(): string[] {
    return this.useAllFiles ? this.gitToolkit.getAllTrackedFiles() : this.gitToolkit.getPreviouslyCommitedFiles();
  }
}
