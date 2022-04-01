import { GitToolkit } from '../../utils/git';
import { FilterStrategy } from './base-filter';

import Debug from 'debug';

const debug = Debug('mookme:list-of-files-filtering-strategy');

export class ListOfFilesPathFilter extends FilterStrategy {
  filePaths: string[];

  constructor(gitToolkit: GitToolkit, useAllFiles = false, filePaths: string[]) {
    super(gitToolkit, useAllFiles);
    this.filePaths = filePaths;
  }

  getFilesPathList(): string[] {
    debug(`ListOfFilesPathFilter.getFilesPathList returning ${this.filePaths}`);
    return this.filePaths;
  }
}
