import {
  DEMO_TRIAL_DAYS,
  DEMO_TRIAL_SHEETS,
  type DemoFixtures,
  demoFixtures,
} from "./fixtures";
import type { MemoryDataStore } from "./memory";

const DAY_MS = 86_400_000;
const FOUNDER_SLOTS = 10;

/**
 * Load the demo accounts, their lots and the sheets they already used into a memory store, the
 * same state `supabase/seed.sql` gives a Supabase project. Projects, documents and groups
 * join in when their repositories exist (slices S-03 and S-04).
 */
export async function loadDemoData(
  store: MemoryDataStore,
  now: Date,
  fixtures: DemoFixtures = demoFixtures,
): Promise<void> {
  const ago = (days: number) => new Date(now.getTime() - days * DAY_MS);

  for (const user of fixtures.users) {
    store.addUser(user.id);
    await store.ledger.grantTrial({
      userId: user.id,
      email: user.email,
      sheets: DEMO_TRIAL_SHEETS,
      days: DEMO_TRIAL_DAYS,
      now: ago(user.trialGrantedDaysAgo),
    });
  }
  const purchaseIds = new Map(fixtures.purchases.map((p) => [p.id, p.id]));
  for (const lot of fixtures.lots) {
    const granted = ago(lot.grantedDaysAgo);
    await store.ledger.grantLot({
      userId: lot.userId,
      origin: lot.origin,
      sheets: lot.sheets,
      expiresAt: new Date(granted.getTime() + lot.validityDays * DAY_MS),
      ...(lot.purchaseId && purchaseIds.has(lot.purchaseId)
        ? { purchaseId: lot.purchaseId }
        : {}),
      now: granted,
    });
  }
  for (const sheet of fixtures.sheets) store.addSheet(sheet.id, sheet.userId);
  for (const reservation of fixtures.reservations) {
    const reserved = await store.ledger.reserveSheet({
      userId: reservation.userId,
      sheetId: reservation.sheetId,
      now,
    });
    if (reserved.ok)
      await store.ledger.commitSheet({ sheetId: reservation.sheetId, now });
  }
  for (const userId of fixtures.founderUserIds) {
    await store.ledger.tryFounderPrice({ userId, slots: FOUNDER_SLOTS });
  }
}
