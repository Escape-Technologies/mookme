import { bus, Events, EventType } from '../events';
import { ExecutionStatus } from '../types/status.types';
import { Renderer } from './renderer';
import { UIPackageItem } from './types';

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
    this.renderer = renderer || new Renderer();
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
    this.started = true;
  }

  /**
   * Stop the UI watchers for rendering
   */
  stop(): void {
    this.started = false;
  }

  /**
   * A helper for updating the status of a package, based on the steps it contains and their statuses
   *
   * @param name - the name of the package
   */
  updatePackageStatus(name: string): void {
    const pkg = this.packages.find((pkg) => pkg.name === name);
    if (pkg) {
      if (
        pkg.steps.every((step) => step.status === ExecutionStatus.SKIPPED || step.status === ExecutionStatus.SUCCESS)
      ) {
        pkg.status = ExecutionStatus.SUCCESS;
        return;
      }
      if (pkg.steps.some((step) => step.status === ExecutionStatus.FAILURE)) {
        pkg.status = ExecutionStatus.FAILURE;
        return;
      }
      if (pkg.steps.some((step) => step.status === ExecutionStatus.RUNNING)) {
        pkg.status = ExecutionStatus.RUNNING;
        return;
      }
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
