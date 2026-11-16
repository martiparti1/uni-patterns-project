import { SeatingComponent } from './SeatingComponent.js';

export class Guest extends SeatingComponent {
  getHeadcount(): number {
    return 1;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name
    }
  }
}