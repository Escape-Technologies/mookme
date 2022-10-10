import { GitToolkit } from '../../utils/git';
import { FilterStrategy } from './base-filter';

import Debug from 'debug';

const debug = Debug('mookme:not-pushed-files-filter-strategy');

export class NotPushedFilesFilterStrategy extends FilterStrategy {
  constructor(gitToolkit: GitToolkit, useAllFiles = false) {
    super(gitToolkit, useAllFiles);
  }

  getFilesPathList(): string[] {
    const files = this.useAllFiles ? this.gitToolkit.getAllTrackedFiles() : this.gitToolkit.getFilesToPush();
    debug(`Using files ${files.join(', ')} for pre-push stategy`);
    return files;
  }
}
