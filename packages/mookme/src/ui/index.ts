import { bus, Events, EventType } from '../events';
import { ExecutionStatus } from '../types/status.types';
import { UIPackageItem } from './types';

import Debug from 'debug';
import { FancyRenderer } from './renderers/fancy-renderer';
import { Renderer } from './renderers/renderer';
const debug = Debug('mookme:ui');

/**
 * A class for managing the UI of Mookme. It provides a logical abstraction of the state of the application.
 *
 * @remarks
 * This abstraction is provided to a renderer instance for being actaully printed
 *
 * @see {@link EventType} for the events to which the UI is sensitive
 */
export class MookmeUI {
  /**
   * The list of packages currently stored and managed by the UI
   */
  packages: UIPackageItem[] = [];
  /**
   * A reference to the interval used for the rendering loop.
   */
  started = true;
  /**
   * The renderer instance used to render the UI state into the console
   */
  renderer: Renderer;

  /**
   *
   * @param start - a boolean denoting if the UI should be automatically started
   * @param renderer - an instance of the {@link Renderer} class used to render the UI state
   */
  constructor(start = true, renderer?: Renderer) {
    this.renderer = renderer || new FancyRenderer();
    this.started = start;

    bus.on(EventType.PackageRegistered, [this.onPackageRegistered.bind(this), this.render.bind(this)]);
    bus.on(EventType.StepRegistered, [this.onStepRegistered.bind(this), this.render.bind(this)]);
    bus.on(EventType.StepStatusChanged, [this.onStepStatusChange.bind(this), this.render.bind(this)]);
  }

  /**
   * Trigger a rendering of the UI if {@link MookmeUI.started} is true, eg. if {@link MookmeUI.start} has been called.
   */
  render(): void {
    // Skip if the UI instance has not been asked to display the ui so far
    if (this.started) {
      this.renderer.render(this.packages);
    }
  }

  /**
   * Start the UI watchers for rendering
   */
  start(): void {
    debug('Starting UI');
    this.started = true;
  }

  /**
   * Stop the UI watchers for rendering
   */
  stop(): void {
    debug('Stopping UI');
    this.started = false;
    this.renderer.stop();
  }

  /**
   * A helper for updating the status of a package, based on the steps it contains and their statuses
   *
   * @param name - the name of the package
   */
  updatePackageStatus(name: string): void {
    debug(`Updating status of package ${name}`);
    const pkg = this.packages.find((pkg) => pkg.name === name);
    if (pkg) {
      if (
        pkg.steps.every((step) => step.status === ExecutionStatus.SKIPPED || step.status === ExecutionStatus.SUCCESS)
      ) {
        debug(
          `Package has only steps in ${ExecutionStatus.SKIPPED} or ${ExecutionStatus.SUCCESS} => marking it as success`,
        );
        pkg.status = ExecutionStatus.SUCCESS;
        return;
      }
      if (pkg.steps.some((step) => step.status === ExecutionStatus.FAILURE)) {
        debug(`Package has at least one step in ${ExecutionStatus.FAILURE} => marking it as failure`);
        pkg.status = ExecutionStatus.FAILURE;
        return;
      }
      if (pkg.steps.some((step) => step.status === ExecutionStatus.RUNNING)) {
        debug(
          `Package has at least one step in ${ExecutionStatus.RUNNING} and no step in ${ExecutionStatus.FAILURE} => marking it as running`,
        );
        pkg.status = ExecutionStatus.RUNNING;
        return;
      }
      debug('Marking package as created (default)');
      pkg.status = ExecutionStatus.CREATED;
    }
  }

  /**
   * Event handler for when a package is registered
   *
   * @param data - the event payload
   * @see {@link Events} for payload's description
   */
  onPackageRegistered(data: Events[EventType.PackageRegistered]): void {
    debug(`Received event "PackageRegistered" with payload ${JSON.stringify(data)}`);
    this.packages.push({
      name: data.name,
      status: ExecutionStatus.CREATED,
      steps: (data.steps || []).map((step) => ({
        ...step,
        status: ExecutionStatus.CREATED,
      })),
    });
  }

  /**
   * Event handler for when a step is registered
   *
   * @param data - the event payload
   * @see {@link Events} for payload's description
   */
  onStepRegistered(data: Events[EventType.StepRegistered]): void {
    debug(`Received event "StepRegistered" with payload ${JSON.stringify(data)}`);
    const pkg = this.packages.find((pkg) => pkg.name === data.packageName);
    if (pkg) {
      pkg.steps.push({
        ...data.step,
        status: ExecutionStatus.CREATED,
      });
      // Update the new state of the step's package
      this.updatePackageStatus(pkg.name);
    }
  }

  /**
   * Event handler for when a step's state change
   *
   * @param data - the event payload
   * @see {@link Events} for payload's description
   */
  onStepStatusChange(data: Events[EventType.StepStatusChanged]): void {
    debug(`Received event "StepStatusChange" with payload ${JSON.stringify(data)}`);
    const pkg = this.packages.find((pkg) => pkg.name === data.packageName);
    if (pkg) {
      const step = pkg.steps.find((step) => step.name === data.stepName);
      if (step) {
        step.status = data.status;
        // Update the new state of the step's package
        this.updatePackageStatus(pkg.name);
      }
    }
  }
}
