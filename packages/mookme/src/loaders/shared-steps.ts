import fs from 'fs';
import path from 'path';

import { StepCommand } from '../types/step.types';

export function loadSharedSteps(sharedFolderPath: string): { [key: string]: StepCommand } {
  return fs.readdirSync(sharedFolderPath).reduce((acc, sharedHookFileName) => {
    if (sharedHookFileName.split('.').pop() !== 'json') {
      return acc;
    }
    const sharedHookName = sharedHookFileName.replace('.json', '');
    return {
      ...acc,
      [sharedHookName]: JSON.parse(
        fs.readFileSync(path.join(sharedFolderPath, sharedHookFileName), 'utf-8'),
      ) as StepCommand,
    };
  }, {});
}
