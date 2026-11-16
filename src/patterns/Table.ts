import { SeatingComponent } from "./SeatingComponent";
import { Family } from "./Family";
import { Guest } from "./Guest";

export type CanSeatResult = {ok: true} | {ok: false; reason: string}

export class Table extends SeatingComponent implements Iterable<Guest>{
    static readonly MAX_FAMILIES = 2;
    static readonly MAX_GUESTS = 10;

    private families: Family[] = [];

    getSeatedFamilies(): readonly Family[]{
        return this.families;
    }

    canSeat(family: Family): CanSeatResult{
        if (this.families.some((f) => f.id === family.id)) {
            return { ok: false, reason: `Family "${family.name}" is already seated at this table.` };
        }
        if (this.families.length >= Table.MAX_FAMILIES) {
            return { ok: false, reason: `Table "${this.name}" already has the maximum of ${Table.MAX_FAMILIES} families.` };
        }
        if (this.getHeadcount() + family.getHeadcount() > Table.MAX_GUESTS) {
            return {
                ok: false,
                reason: `Adding "${family.name}" (${family.getHeadcount()}) exceeds max capacity of ${Table.MAX_GUESTS} guests.`,
            };
        }

        for (const seatedFamily of this.families) {
            if (seatedFamily.hasConflictWith(family)) {
                return {
                ok: false,
                reason: `Conflict: Family "${family.name}" cannot sit with "${seatedFamily.name}".`,
                };
            }
        }
        return { ok: true };
    }

    seatFamily(family: Family): void{
        const check = this.canSeat(family);
        if(!check.ok) throw new Error(check.reason);
        this.families.push(family);
    }

    removeFamily(familyId: string): void{
        this.families = this.families.filter((f) => f.id != familyId);
    }

    //* abstract methods
    getHeadcount(): number {
        return this.families.reduce((sum, family) => sum + family.getHeadcount(), 0);
    }

    toJSON() {
        return {
            id: this.id,
            tableName: this.name,
            occupiedSeats: `${this.getHeadcount()}/${Table.MAX_GUESTS}`,
            familiesCount: `${this.families.length}/${Table.MAX_FAMILIES}`,
            families: this.families.map((f) => f.toJSON()),
        };
    }

    //* iterator
    *[Symbol.iterator](): IterableIterator<Guest>{
        for(const family of this.families){
            yield* family;
        }
    }
}