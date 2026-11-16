import express, { Request, Response } from 'express';
import { WeddingHall } from './patterns/WeddingHall.js';
import { Family } from './patterns/Family.js';
import { Guest } from './patterns/Guest.js';

const app = express();
app.use(express.json());

const hall = new WeddingHall('Grand Ballroom');

const getErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'Unexpected error occurred';

app.post('/tables', (req: Request<{}, {}, { id?: string; name?: string }>, res: Response) => {
  const { id, name } = req.body;
  if (!id || !name) {
    res.status(400).json({ error: 'id and name are required' });
    return;
  }

  const table = hall.addTable(id, name);
  res.status(201).json(table.toJSON());
});

app.post('/families', (req: Request<{}, {}, { id?: string; name?: string; guests?: string[] }>, res: Response) => {
  try {
    const { id, name, guests = [] } = req.body;
    if (!id || !name) {
      res.status(400).json({ error: 'id and name are required' });
      return;
    }

    const family = new Family(id, name);
    guests.forEach((guestName, index) => {
      family.addGuest(new Guest(`${id}-g${index + 1}`, guestName));
    });

    hall.registerFamily(family);
    res.status(201).json(family.toJSON());
  } catch (err) {
    res.status(400).json({ error: getErrorMessage(err) });
  }
});

app.post('/restrictions', (req: Request<{}, {}, { familyIdA?: string; familyIdB?: string }>, res: Response) => {
  try {
    const { familyIdA, familyIdB } = req.body;
    if (!familyIdA || !familyIdB) {
      res.status(400).json({ error: 'familyIdA and familyIdB are required' });
      return;
    }
    hall.addRestriction(familyIdA, familyIdB);
    res.json({ message: `Restriction added between ${familyIdA} and ${familyIdB}` });
  } catch (err) {
    res.status(400).json({ error: getErrorMessage(err) });
  }
});

app.post('/tables/:tableId/seat', (req: Request<{ tableId: string }, {}, { familyId?: string }>, res: Response) => {
  try {
    const { familyId } = req.body;
    if (!familyId) {
      res.status(400).json({ error: 'familyId is required' });
      return;
    }
    const table = hall.seatFamilyAtTable(familyId, req.params.tableId);
    res.json(table.toJSON());
  } catch (err) {
    res.status(400).json({ error: getErrorMessage(err) });
  }
});

app.post('/seating/auto', (_req: Request, res: Response) => {
  const result = hall.autoSeatAll();
  res.json({ ...result, plan: hall.toJSON() });
});

app.get('/seating', (_req: Request, res: Response) => {
  res.json(hall.toJSON());
});

app.get('/guests/seated', (_req: Request, res: Response) => {
  const list = Array.from(hall, (entry) => ({
    table: entry.table,
    guest: entry.guest.name,
  }));
  res.json({ total: list.length, guests: list });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Wedding seating API running on port ${PORT}`);
});