import { PackageHook } from '../../types/hook.types';

/**
 * A base class for denoting a strategy used to filter hooks to run
 */
export abstract class FilterStrategy {
  async filter(hooks: PackageHook[]): Promise<PackageHook[]> {
    return hooks;
  }
}
