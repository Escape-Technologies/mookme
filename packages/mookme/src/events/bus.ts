import { EventEmitter } from 'events';
import { Events } from './events';

class EventBus<T extends { [key: string]: unknown }> {
  private _eventEmitter: EventEmitter;

  constructor() {
    this._eventEmitter = new EventEmitter();
  }

  on<K extends keyof T>(s: K, listener: (v: T[K]) => void) {
    this._eventEmitter.on(s.toString(), listener);
  }

  emit<K extends keyof T>(s: K, payload: T[K]) {
    this._eventEmitter.emit(s.toString(), payload);
  }
}

export const bus = new EventBus<Events>();
