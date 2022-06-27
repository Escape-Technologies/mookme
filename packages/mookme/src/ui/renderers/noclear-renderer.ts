import chalk from 'chalk';
import { Renderer } from './renderer';
import { ExecutionStatus } from '../../types/status.types';
import { UIPackageItem } from '../types';
import { ConsoleCanvas } from '../writer';

const randColorHexFactory = () => {
  const color = chalk.hex('#' + ((Math.random() * 0xffffff) << 0).toString(16));
  return (msg: string) => color(msg);
};

const stepDisplayedStatuses = {
  [ExecutionStatus.CREATED]: 'created',
  [ExecutionStatus.RUNNING]: 'running',
  [ExecutionStatus.FAILURE]: 'error',
  [ExecutionStatus.SUCCESS]: 'done',
  [ExecutionStatus.SKIPPED]: 'skipped',
};

/**
 * A class designed for rendering the UI state object into console statements
 */
export class NoClearRenderer implements Renderer {
  writer: ConsoleCanvas;
  currentPackages?: UIPackageItem[];
  packagesColorizers: Map<string, (msg: string) => string> = new Map();

  /**
   * Constructor for the renderer class
   *
   * @param canvas - a pre-defined instance of the canvas to use. It is rendered otherwise
   */
  constructor(canvas?: ConsoleCanvas) {
    this.writer = canvas || new ConsoleCanvas();
  }

  stop(): void {
    return;
  }

  get packagesStatusMap(): Map<string, { status: ExecutionStatus; steps: Map<string, ExecutionStatus> }> {
    const packagesStatusMap = new Map<string, { status: ExecutionStatus; steps: Map<string, ExecutionStatus> }>();

    for (const pkg of this.currentPackages || []) {
      const stepsStatusMap = new Map<string, ExecutionStatus>();
      for (const step of pkg.steps) {
        stepsStatusMap.set(step.name, step.status);
      }
      packagesStatusMap.set(pkg.name, {
        status: pkg.status,
        steps: stepsStatusMap,
      });
    }

    return packagesStatusMap;
  }

  /**
   * Render the UI state onto the console canvas
   *
   * @param packages - the list of packages to render, resuming the UI current state
   */
  render(packages: UIPackageItem[]): void {
    for (const pkg of packages) {
      if (!this.packagesColorizers.has(pkg.name)) this.packagesColorizers.set(pkg.name, randColorHexFactory());
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const colorizer = this.packagesColorizers.get(pkg.name)!;

      const pkgStatusMap = this.packagesStatusMap.get(pkg.name);

      if (!pkgStatusMap) {
        const pkgLine = colorizer(`${pkg.name}:${stepDisplayedStatuses[pkg.status]}`);
        this.writer.write(pkgLine);
        for (const step of pkg.steps) {
          const stepLine = colorizer(`${pkg.name}:${step.name}:${stepDisplayedStatuses[pkg.status]}`);
          this.writer.write(stepLine);
        }
        continue;
      }

      if (pkgStatusMap.status !== pkg.status) {
        const pkgLine = colorizer(`${pkg.name}:${stepDisplayedStatuses[pkg.status]}`);
        this.writer.write(pkgLine);
      }

      for (const step of pkg.steps) {
        if (pkgStatusMap.steps.get(step.name) !== step.status) {
          const stepLine = colorizer(`${pkg.name}:${step.name}:${stepDisplayedStatuses[pkg.status]}`);
          this.writer.write(stepLine);
        }
      }
    }

    this.currentPackages = packages.map((pkg) => ({
      ...pkg,
      steps: pkg.steps.map((step) => ({
        ...step,
      })),
    }));
  }
}
