import { PackageHook } from '../../types/hook.types';
import { FilterStrategy } from './base-filter';

/**
 * A base class for denoting a strategy used to filter hooks to run
 */
export class PreviousCommitFilterStrategy extends FilterStrategy {
  async filter(hooks: PackageHook[]): Promise<PackageHook[]> {
    return hooks;
  }
}
