import { loadProjectConfig } from '../loaders/config';
import { ExecutionContext, MookmeConfig, ProjectConfig } from './types';

export class Config {
  private config?: MookmeConfig;
  public executionContext: ExecutionContext = {};

  init(): void {
    if (!this.config) {
      this.config = {
        project: loadProjectConfig(),
      };
    }
  }

  updateExecutionContext(newContext: ExecutionContext): void {
    this.executionContext = {
      ...this.executionContext,
      ...newContext,
    };
  }

  get project(): ProjectConfig {
    if (!this.config) {
      console.trace('Config object has not been initialized');
      process.exit(1);
    }
    return this.config.project;
  }
}

export default new Config();
