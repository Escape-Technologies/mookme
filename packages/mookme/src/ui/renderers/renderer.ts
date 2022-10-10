import { UIPackageItem } from '../types';
import { ConsoleCanvas } from '../writer';

export interface Renderer {
  writer: ConsoleCanvas;
  render(packages: UIPackageItem[]): void;
  stop(): void;
}
