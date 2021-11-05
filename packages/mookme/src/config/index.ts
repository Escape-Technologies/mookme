import { loadAuthConfig, loadCLIConfig, loadProjectConfig } from '../loaders/config';
import { AuthConfig, CLIConfig, ExecutionContext, MookmeConfig, ProjectConfig } from './types';

export class Config {
  private config?: MookmeConfig;
  public executionContext: ExecutionContext = {};

  init(): void {
    if (!this.config) {
      this.config = {
        auth: loadAuthConfig(),
        cli: loadCLIConfig(),
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

  get cli(): CLIConfig {
    if (!this.config) {
      console.trace('Config object has not been initialized');
      process.exit(1);
    }
    return this.config.cli;
  }

  get auth(): AuthConfig {
    if (!this.config) {
      console.trace('Config object has not been initialized');
      process.exit(1);
    }
    return this.config.auth;
  }
}

export default new Config();
