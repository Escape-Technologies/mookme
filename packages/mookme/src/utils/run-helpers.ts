import { StepError } from '../types/step.types';
import logger from './logger';

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
