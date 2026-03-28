import type { Model } from './Model';

export class ResetFile {
  readonly name: string;
  private history: Model[] = [];
  private currentIndex: number = -1;

  constructor(name: string, initialModel?: Model) {
    this.name = name;
    if (initialModel) {
      this.history.push(this.cloneModel(initialModel));
      this.currentIndex = 0;
    }
  }

  // Create a deep clone of a Model to prevent mutations
  private cloneModel(model: Model): Model {
    return {
      width: model.width,
      height: model.height,
      pixels: model.pixels.map(row => [...row]),
      palette: [...model.palette],
    };
  }

  // Push a new model onto the history stack
  push(model: Model): void {
    this.currentIndex++;
    this.history = this.history.slice(0, this.currentIndex);
    this.history.push(this.cloneModel(model));
  }

  // Undo: pop back to previous state
  undo(): Model | undefined {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return undefined;
  }

  // Redo: move forward in history
  redo(): Model | undefined {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return undefined;
  }

  // Get the current model without removing it
  current(): Model | undefined {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.cloneModel(this.history[this.currentIndex]!);
    }
    return undefined;
  }

  // Check if undo is available
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  // Check if redo is available
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  // Get the current size of the history
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
    this.currentIndex = -1;
  }

  // Get a copy of the entire history (for debugging or serialization)
  getHistory(): Model[] {
    return this.history.map(model => this.cloneModel(model));
  }
}
