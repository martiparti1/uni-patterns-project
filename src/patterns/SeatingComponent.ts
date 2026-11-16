export abstract class SeatingComponent {
  constructor(
    public readonly id: string,
    public readonly name: string
  ) {}

  abstract getHeadcount(): number;

  abstract toJSON(): Record<string, unknown>;
}