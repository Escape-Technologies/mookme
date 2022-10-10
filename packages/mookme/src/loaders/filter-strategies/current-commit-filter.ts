import { GitToolkit } from '../../utils/git';
import { FilterStrategy } from './base-filter';

/**
 * Filter a list of packages based on the VCS state, and the staged files it holds.
 */
export class CurrentCommitFilterStrategy extends FilterStrategy {
  constructor(gitToolkit: GitToolkit, useAllFiles = false) {
    super(gitToolkit, useAllFiles);
  }

  getFilesPathList(): string[] {
    return this.useAllFiles ? this.gitToolkit.getAllTrackedFiles() : this.gitToolkit.getStagedFiles();
  }
}
