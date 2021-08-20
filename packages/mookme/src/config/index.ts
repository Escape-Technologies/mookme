import { loadAuthConfig, loadCLIConfig, loadPackageJSONandProjectConfig } from './loaders';
import { AuthConfig, CLIConfig, ExecutionContext, MookmeConfig, PkgJSON, ProjectConfig } from './types';

let CONFIG: MookmeConfig;

export class Config {
  private config: MookmeConfig;
  public executionContext: ExecutionContext = {};

  static loadConfig(): void {
    CONFIG = {
      auth: loadAuthConfig(),
      cli: loadCLIConfig(),
      ...loadPackageJSONandProjectConfig(),
    };
  }

  constructor() {
    if (!CONFIG) {
      Config.loadConfig();
    }
    this.config = CONFIG;
  }

  updateExecutionContext(newContext: ExecutionContext): void {
    this.executionContext = {
      ...this.executionContext,
      ...newContext,
    };
  }

  get project(): ProjectConfig {
    return this.config.project;
  }

  get cli(): CLIConfig {
    return this.config.cli;
  }

  get auth(): AuthConfig {
    return this.config.auth;
  }

  get packageJSON(): PkgJSON {
    return this.config.packageJSON;
  }
}

export default new Config();
