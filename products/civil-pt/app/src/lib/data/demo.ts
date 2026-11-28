import {
  DEMO_TRIAL_DAYS,
  DEMO_TRIAL_SHEETS,
  type DemoFixtures,
  demoFixtures,
} from "./fixtures";
import type { MemoryDataStore } from "./memory";

const DAY_MS = 86_400_000;
const FOUNDER_SLOTS = 10;

/** A2 landscape in PDF points, what `supabase/seed.sql` gives every demo sheet. */
const DEMO_SHEET_WIDTH_PT = 1683.78;
const DEMO_SHEET_HEIGHT_PT = 1190.55;

/**
 * Load the demo accounts, their projects, documents, sheets and lots into a memory store, the
 * same state `supabase/seed.sql` gives a Supabase project. Groups join in with slice S-04.
 * The demo documents have no file behind them (storage starts empty), so their sheets can be
 * listed and given a scale but not rendered.
 */
export async function loadDemoData(
  store: MemoryDataStore,
  now: Date,
  fixtures: DemoFixtures = demoFixtures,
): Promise<void> {
  const ago = (days: number) => new Date(now.getTime() - days * DAY_MS);

  for (const user of fixtures.users) {
    store.addUser(user.id, { email: user.email, locale: user.locale, role: user.role });
    await store.ledger.grantTrial({
      userId: user.id,
      email: user.email,
      sheets: DEMO_TRIAL_SHEETS,
      days: DEMO_TRIAL_DAYS,
      now: ago(user.trialGrantedDaysAgo),
    });
  }
  for (const lot of fixtures.lots) {
    const granted = ago(lot.grantedDaysAgo);
    await store.ledger.grantLot({
      userId: lot.userId,
      origin: lot.origin,
      sheets: lot.sheets,
      expiresAt: new Date(granted.getTime() + lot.validityDays * DAY_MS),
      ...(lot.purchaseId ? { purchaseId: lot.purchaseId } : {}),
      now: granted,
    });
  }
  for (const project of fixtures.projects) {
    store.workspace.seedProject({
      id: project.id,
      userId: project.userId,
      name: project.name,
      createdAt: ago(1),
    });
  }
  for (const document of fixtures.documents) {
    store.workspace.seedDocument({
      id: document.id,
      projectId: document.projectId,
      userId: document.userId,
      // Same path the seed.sql uses: <user>/<project>/<document>.pdf
      storagePath: `${document.userId}/${document.projectId}/${document.id}.pdf`,
      fileName: document.fileName,
      sizeBytes: document.sizeBytes,
      pageCount: document.pageCount,
      status: "ready",
      createdAt: ago(1),
    });
  }
  for (const sheet of fixtures.sheets) {
    store.workspace.seedSheet({
      id: sheet.id,
      documentId: sheet.documentId,
      projectId: sheet.projectId,
      userId: sheet.userId,
      pageNo: sheet.pageNo,
      widthPt: DEMO_SHEET_WIDTH_PT,
      heightPt: DEMO_SHEET_HEIGHT_PT,
      scaleRatio: sheet.scaleRatio,
      scaleSource: sheet.scaleRatio === null ? null : "detected",
      status: sheet.status,
      needsRecalc: false,
      createdAt: ago(1),
    });
  }
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
