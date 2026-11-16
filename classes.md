# Описание на класовете

### `SeatingComponent` (Abstract Base Class — Component)
* **Роля в архитектурата:** Базов абстрактен клас в **Composite Pattern**. Дефинира общия договор, чрез който клиентският код (и самите композити) третира единичен гост, семейство, маса и цялата зала по еднакъв начин.
* **Свойства:**
  * `public readonly id: string` — Уникален идентификатор на компонента.
  * `public readonly name: string` — Наименование на компонента (име на гост, фамилия, номер на маса или име на зала).
* **Абстрактни методи:**
  * `getHeadcount(): number` — Връща броя хора в текущия възел и всички негови наследници.
  * `toJSON(): Record<string, unknown>` — Сериализира възела и неговите деца в JSON структура.

---

### `Guest` (Leaf)
* **Роля в архитектурата:** Листо (Leaf) в **Composite** дървото. Представлява отделен гост и няма дъщерни елементи.
* **Наследяване:** Наследява директно конструктора на `SeatingComponent`.
* **Методи:**
  * `getHeadcount(): number` — Винаги връща `1`.
  * `toJSON()` — Връща `{ id, name }`.

---

### `Family` (Composite + Iterable)
* **Роля в архитектурата:** Групира гости от една фамилия и пази бизнес правилата за конфликти с други фамилии. Имплементира `Iterable<Guest>`.
* **Свойства:**
  * `private readonly guests: Guest[]` — Списък с членовете на семейството.
  * `private readonly conflicts: Set<string>` — Множество от `id`-та на семейства, с които тази фамилия не може да седи на една маса.
* **Методи:**
  * `addGuest(guest: Guest): void` — Добавя гост към семейството.
  * `addConflict(otherFamilyId: string): void` — Регистрира забрана за съвместно сядане (валидира да не е със самото себе си).
  * `hasConflictWith(otherFamily: Family): boolean` — Симетрична проверка за наличие на конфликт между две семейства.
  * `getHeadcount(): number` — Делегира към `guest.getHeadcount()` за всеки гост и сумира резултата.
  * `*[Symbol.iterator](): IterableIterator<Guest>` — **Iterator Pattern**: позволява директно обхождане (`for...of`) на гостите в семейството.

---

### `Table` (Composite + Iterable)
* **Роля в архитектурата:** Представлява сватбена маса, която съдържа семейства и налага ограниченията за капацитет и съвместимост. Имплементира `Iterable<Guest>`.
* **Константи и свойства:**
  * `static readonly MAX_FAMILIES = 2` — Максимум 2 семейства на маса.
  * `static readonly MAX_GUESTS = 10` — Максимум 10 души на маса.
  * `private families: Family[]` — Настанените на масата семейства.
* **Методи:**
  * `canSeat(family: Family): CanSeatResult` — Проверява 4 бизнес правила:
    1. Дали семейството вече не е на тази маса.
    2. Дали има по-малко от 2 семейства (`MAX_FAMILIES`).
    3. Дали общият брой хора няма да надвиши 10 (`MAX_GUESTS`).
    4. Дали новото семейство няма конфликт с някое от вече настанените семейства.
  * `seatFamily(family: Family): void` — Извиква `canSeat()` и добавя семейството или хвърля грешка с конкретната причина.
  * `removeFamily(familyId: string): void` — Премахва семейство от масата (използва се при преместване).
  * `getHeadcount(): number` — Сумира `family.getHeadcount()` за настанените семейства.
  * `*[Symbol.iterator](): IterableIterator<Guest>` — **Iterator Pattern**: чрез `yield* family` делегира итерацията към всяко семейство и връща плосък поток от `Guest` обекти.

---

### `WeddingHall` (Root Composite + Iterable)
* **Роля в архитектурата:** Коренът (Root) на Composite дървото и основна фасада за бизнес операциите в паметта. Имплементира `Iterable<SeatedGuestEntry>`.
* **Свойства:**
  * `private readonly tables: Table[]` — Всички маси в залата.
  * `private readonly families: Map<string, Family>` — Регистър на всички поканени семейства.
* **Методи:**
  * `addTable(id: string, name: string): Table` — Създава и добавя нова маса в залата.
  * `registerFamily(family: Family): Family` — Регистрира семейство (валидира, че не надвишава максималния капацитет на маса от 10 души).
  * `addRestriction(familyIdA: string, familyIdB: string): void` — Създава двупосочна забрана между две регистрирани семейства.
  * `seatFamilyAtTable(familyId: string, tableId: string): Table` — Ръчно настанява семейство на конкретна маса (ако е било на друга, първо го освобождава от там).
  * `autoSeatAll(): { failedToSeat: string[] }` — Автоматично разпределя всички все още ненастанени семейства по свободните маси, спазвайки капацитета и забраните.
  * `getHeadcount(): number` — Връща общия брой настанени гости в цялата зала.
  * `*[Symbol.iterator](): IterableIterator<SeatedGuestEntry>` — **Iterator Pattern**: обхожда всички маси и техните итератори, връщайки `{ table: string, guest: Guest }` за всеки настанен гост.