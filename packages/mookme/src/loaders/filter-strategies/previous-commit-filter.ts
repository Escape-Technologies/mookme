import { GitToolkit } from '../../utils/git';
import { FilterStrategy } from './base-filter';

/**
 * A base class for denoting a strategy used to filter hooks to run
 */
export class PreviousCommitFilterStrategy extends FilterStrategy {
  constructor(gitToolkit: GitToolkit, useAllFiles = false) {
    super(gitToolkit, useAllFiles);
  }

  getFilesPathList(): string[] {
    return this.useAllFiles ? this.gitToolkit.getAllTrackedFiles() : this.gitToolkit.getPreviouslyCommitedFiles();
  }
}
