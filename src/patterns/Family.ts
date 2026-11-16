import { SeatingComponent } from "./SeatingComponent";
import { Guest } from "./Guest";
export class Family extends SeatingComponent implements Iterable<Guest>{
    private readonly guests: Guest[] = [];
    private readonly conflicts = new Set<string>();

    addGuest(guest: Guest){
        this.guests.push(guest);
    }

    addConflict(otherFamilyId: string){
        if(otherFamilyId === this.id){
            throw new Error('A family cannot have a conflict with itself');
        }

        this.conflicts.add(otherFamilyId);
    }

    hasConflictWith(otherFamily: Family): boolean{
        return this.conflicts.has(otherFamily.id) || otherFamily.conflicts.has(this.id);
    }

    //* abstract methods
    getHeadcount(): number {
        return this.guests.reduce((sum, guest) => sum + guest.getHeadcount(), 0);
    }

    toJSON(){
        return{
            id: this.id,
            familyName: this.name,
            headcount: this.getHeadcount(),
            conflictWith: this.conflicts,
            guests: this.guests.map((g) => g.toJSON())
        }
    }

    //* iterator

    *[Symbol.iterator](): IterableIterator<Guest>{
        for(const guest of this.guests){
            yield guest;
        }
    }

}