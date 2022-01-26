import { bus, Events, EventType } from '../events';
import { Renderer } from './renderer';
import { UIExecutionStatus, UIPackageItem } from './types';

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
  interval?: ReturnType<typeof setInterval>;
  /**
   * The renderer instance used to render the UI state into the console
   */
  renderer: Renderer;

  /**
   *
   * @param start - a boolean denoting if the UI should be automatically started
   * @param renderer - an instance of the {@link Renderer} class used to render the UI state
   */
  constructor(start = false, renderer?: Renderer) {
    this.renderer = renderer || new Renderer();

    bus.on(EventType.PackageRegistered, this.onPackageRegistered.bind(this));
    bus.on(EventType.StepRegistered, this.onStepRegistered.bind(this));
    bus.on(EventType.StepRunning, this.onStepRunning.bind(this));
    bus.on(EventType.StepSuccess, this.onStepSuccess.bind(this));
    bus.on(EventType.StepFailure, this.onStepFailure.bind(this));
    bus.on(EventType.StepSkipped, this.onStepSkipped.bind(this));

    if (start) {
      this.start();
    }
  }

  /**
   * Start the UI rendering loop
   */
  start(): void {
    this.interval = setInterval(() => this.renderer.render(this.packages), 50);
  }

  /**
   * Stop the UI rendering loop
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
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
      status: UIExecutionStatus.CREATED,
      steps: (data.steps || []).map((step) => ({
        ...step,
        status: UIExecutionStatus.CREATED,
      })),
    });
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
        pkg.steps.every(
          (step) => step.status === UIExecutionStatus.SKIPPED || step.status === UIExecutionStatus.SUCCESS,
        )
      ) {
        pkg.status = UIExecutionStatus.SUCCESS;
        return;
      }
      if (pkg.steps.some((step) => step.status === UIExecutionStatus.FAILURE)) {
        pkg.status = UIExecutionStatus.FAILURE;
        return;
      }
      if (pkg.steps.some((step) => step.status === UIExecutionStatus.RUNNING)) {
        pkg.status = UIExecutionStatus.RUNNING;
        return;
      }
      pkg.status = UIExecutionStatus.CREATED;
    }
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
        status: UIExecutionStatus.CREATED,
      });
      this.updatePackageStatus(pkg.name);
    }
  }

  /**
   * Event handler for when a step is running
   *
   * @param data - the event payload
   * @see {@link Events} for payload's description
   */
  onStepRunning(data: Events[EventType.StepRunning]): void {
    const pkg = this.packages.find((pkg) => pkg.name === data.packageName);
    if (pkg) {
      const step = pkg.steps.find((step) => step.name === data.stepName);
      if (step) {
        step.status = UIExecutionStatus.RUNNING;
        this.updatePackageStatus(pkg.name);
      }
    }
  }

  /**
   * Event handler for when a step is successful
   *
   * @param data - the event payload
   * @see {@link Events} for payload's description
   */
  onStepSuccess(data: Events[EventType.StepSuccess]): void {
    const pkg = this.packages.find((pkg) => pkg.name === data.packageName);
    if (pkg) {
      const step = pkg.steps.find((step) => step.name === data.stepName);
      if (step) {
        step.status = UIExecutionStatus.SUCCESS;
        this.updatePackageStatus(pkg.name);
      }
    }
  }

  /**
   * Event handler for when a step is skipped
   *
   * @param data - the event payload
   * @see {@link Events} for payload's description
   */
  onStepSkipped(data: Events[EventType.StepSkipped]): void {
    const pkg = this.packages.find((pkg) => pkg.name === data.packageName);
    if (pkg) {
      const step = pkg.steps.find((step) => step.name === data.stepName);
      if (step) {
        step.status = UIExecutionStatus.SKIPPED;
        this.updatePackageStatus(pkg.name);
      }
    }
  }

  /**
   * Event handler for when a step has failed
   *
   * @param data - the event payload
   * @see {@link Events} for payload's description
   */
  onStepFailure(data: Events[EventType.StepFailure]): void {
    const pkg = this.packages.find((pkg) => pkg.name === data.packageName);
    if (pkg) {
      const step = pkg.steps.find((step) => step.name === data.stepName);
      if (step) {
        step.status = UIExecutionStatus.FAILURE;
        this.updatePackageStatus(pkg.name);
      }
    }
  }
}
