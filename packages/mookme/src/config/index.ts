import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { ADDED_BEHAVIORS } from './types';

/**
 * This class holds the types and attributes retrieved from `.mookme.json`
 */
export class Config {
  addedBehavior: ADDED_BEHAVIORS;

  /**
   * Instanciate a config object by loading the JSON config file, or defaults to a default configuration.
   * @param rootDir - the base absolute path where the `.mookme.json should be found`
   */
  constructor(rootDir: string) {
    // Determine the absolute path to the .mookme.json file
    const configFilePath = path.join(rootDir, '.mookme.json');

    // Test it's existence, and default to the default configuration if there is an issue
    if (!fs.existsSync(configFilePath)) {
      logger.warning(`No \`.mookme.json\` file found at path ${rootDir} proceeding with a default configuration`);
      this.addedBehavior = ADDED_BEHAVIORS.ADD_AND_COMMIT;
    } else {
      // Load the file and add it's content to the correct attributes
      // @TODO: verify the content of the config file
      const configFromFile = JSON.parse(fs.readFileSync(configFilePath).toString());
      this.addedBehavior = configFromFile.addedBehavior
        ? (configFromFile.addedBehavior as ADDED_BEHAVIORS)
        : ADDED_BEHAVIORS.ADD_AND_COMMIT;
    }
  }
}
