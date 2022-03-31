import { GitToolkit } from '../../utils/git';
import { FilterStrategy } from './base-filter';
import Debug from 'debug';

const debug = Debug('mookme:from-to-filter-strategy');

/**
 * Filter a list of packages based on the VCS state, and the staged files it holds.
 */
export class FromToFilterStrategy extends FilterStrategy {
  from: string;
  to: string;

  /**
   * @param from - the Git reference where to keep changed files from
   * @param to - the Git reference until where to keep changed files
   */
  constructor(gitToolkit: GitToolkit, useAllFiles = false, from: string, to: string) {
    super(gitToolkit, useAllFiles);
    this.from = from;
    this.to = to;
  }

  getFilesPathList(): string[] {
    debug(`Filtering files between ${this.from} and ${this.to}`);
    return this.gitToolkit.getFilesChangedBetweenRefs(this.from, this.to);
  }
}
