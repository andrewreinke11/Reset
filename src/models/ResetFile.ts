import type { Model } from './Model';

export class ResetFile {
  private history: Model[] = [];

  constructor(initialModel?: Model) {
    if (initialModel) {
      this.history.push(initialModel);
    }
  }

  // Push a new model onto the history stack
  push(model: Model): void {
    this.history.push(model);
  }

  // Pop the most recent model from the history stack
  pop(): Model | undefined {
    return this.history.pop();
  }

  // Peek at the most recent model without removing it
  peek(): Model | undefined {
    return this.history.length > 0 ? this.history[this.history.length - 1] : undefined;
  }

  // Get the current size of the history stack
  size(): number {
    return this.history.length;
  }

  // Check if the history stack is empty
  isEmpty(): boolean {
    return this.history.length === 0;
  }

  // Clear the entire history stack
  clear(): void {
    this.history = [];
  }

  // Get a copy of the entire history (for debugging or serialization)
  getHistory(): Model[] {
    return [...this.history];
  }
}
