import { SeatingComponent } from './SeatingComponent.js';
import { Table } from './Table.js';
import { Family } from './Family.js';
import { Guest } from './Guest.js';

export interface SeatedGuestEntry {
  table: string;
  guest: Guest;
}

export class WeddingHall extends SeatingComponent implements Iterable<SeatedGuestEntry> {
  private readonly tables: Table[] = [];
  private readonly families = new Map<string, Family>();

  constructor(name = 'Main Wedding Hall') {
    super('hall-1', name);
  }

  addTable(id: string, name: string): Table {
    const table = new Table(id, name);
    this.tables.push(table);
    return table;
  }

  registerFamily(family: Family): Family {
    if (family.getHeadcount() > Table.MAX_GUESTS) {
      throw new Error(`Family "${family.name}" has more than ${Table.MAX_GUESTS} members and cannot fit on any table.`);
    }
    this.families.set(family.id, family);
    return family;
  }

  addRestriction(familyIdA: string, familyIdB: string): void {
    const famA = this.families.get(familyIdA);
    const famB = this.families.get(familyIdB);
    if (!famA || !famB) {
      throw new Error('One or both families not found.');
    }
    famA.addConflict(famB.id);
    famB.addConflict(famA.id);
  }

  seatFamilyAtTable(familyId: string, tableId: string): Table {
    const family = this.families.get(familyId);
    const table = this.tables.find((t) => t.id === tableId);
    if (!family) throw new Error(`Family "${familyId}" not found.`);
    if (!table) throw new Error(`Table "${tableId}" not found.`);

    for (const t of this.tables) {
      t.removeFamily(familyId);
    }

    table.seatFamily(family);
    return table;
  }

  autoSeatAll(): { failedToSeat: string[] } {
    const seatedIds = new Set<string>();
    for (const table of this.tables) {
      for (const fam of table.getSeatedFamilies()) {
        seatedIds.add(fam.id);
      }
    }

    const unseated = Array.from(this.families.values()).filter((f) => !seatedIds.has(f.id));
    const failed: string[] = [];

    for (const family of unseated) {
      const targetTable = this.tables.find((t) => t.canSeat(family).ok);
      if (targetTable) {
        targetTable.seatFamily(family);
      } else {
        failed.push(family.name);
      }
    }

    return { failedToSeat: failed };
  }

  getHeadcount(): number {
    return this.tables.reduce((sum, table) => sum + table.getHeadcount(), 0);
  }

  *[Symbol.iterator](): IterableIterator<SeatedGuestEntry> {
    for (const table of this.tables) {
      for (const guest of table) {
        yield { table: table.name, guest };
      }
    }
  }

  toJSON() {
    return {
      hall: this.name,
      totalSeatedGuests: this.getHeadcount(),
      tables: this.tables.map((t) => t.toJSON()),
    };
  }
}