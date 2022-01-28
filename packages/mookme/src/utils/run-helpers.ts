import path from 'path';
import wcmatch from 'wildcard-match';
import { StepError } from '../types/step.types';
import logger from './logger';

export function getMatchedFiles(
  pattern: string,
  packagePath: string,
  stagedFiles: string[] | undefined,
  rootDir: string,
): string[] {
  const matcher = wcmatch(pattern);

  return (stagedFiles || [])
    .map((fPath: string) => path.join(rootDir, fPath))
    .filter((fPath: string) => {
      return fPath.includes(packagePath);
    })
    .map((fPath: string) => fPath.replace(`${packagePath}/`, ''))
    .filter((rPath: string) => matcher(rPath));
}

export function processResults(results: StepError[][]): void {
  results.forEach((packageErrors) => {
    packageErrors.forEach((err) => {
      logger.failure(`\nHook of package ${err.hook.name} failed at step ${err.step.name} `);
      logger.log(err.error.message);
    });
    if (packageErrors.length > 0) {
      process.exit(1);
    }
  });
}
