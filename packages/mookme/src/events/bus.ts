import { EventEmitter } from 'events';
import { Events } from './events';

export class EventBus<T extends { [key: string]: unknown }> {
  private _eventEmitter: EventEmitter;

  constructor() {
    this._eventEmitter = new EventEmitter();
  }

  on<K extends keyof T>(s: K, listeners: Array<(v: T[K]) => void>): void {
    this._eventEmitter.on(s.toString(), (v) => {
      for (const listener of listeners) {
        listener(v);
      }
    });
  }

  emit<K extends keyof T>(s: K, payload: T[K]): void {
    this._eventEmitter.emit(s.toString(), payload);
  }
}

export const bus = new EventBus<Events>();
