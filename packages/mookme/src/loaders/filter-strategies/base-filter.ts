import { PackageHook, UnprocessedPackageHook } from '../../types/hook.types';

/**
 * A base class for denoting a strategy used to filter hooks to run
 */
export abstract class FilterStrategy {
  async filter(hooks: UnprocessedPackageHook[]): Promise<PackageHook[]> {
    return hooks.map((hook) => ({
      ...hook,
      matchedFiles: [],
      steps: hook.steps.map((step) => ({
        ...step,
        matchedFiles: [],
      })),
    }));
  }
}
