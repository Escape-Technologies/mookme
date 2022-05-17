import { GitToolkit } from '../../utils/git';
import { FilterStrategy } from './base-filter';

import Debug from 'debug';

const debug = Debug('mookme:not-pushed-files-filter-strategy');

export class NotPushedFilesFilter extends FilterStrategy {
  constructor(gitToolkit: GitToolkit, useAllFiles = false) {
    super(gitToolkit, useAllFiles);
  }

  getFilesPathList(): string[] {
    const branchName = this.gitToolkit.getCurrentBranchName()
    return this.useAllFiles ? this.gitToolkit.getAllTrackedFiles() : this.gitToolkit.getFilesChangedBetweenRefs('HEAD', `origin/HEAD`);
  }
}
