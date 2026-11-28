/**
 * Demo data: one set of fixtures for every environment that needs a populated product.
 *
 * - `supabase/seed.sql` is GENERATED from this file (`npm run seed`), so a local or preview
 *   Supabase project and the in-memory store show the same five accounts. A test fails when
 *   the committed seed.sql drifts from these fixtures.
 * - The in-memory store loads the accounts and their lots at startup (`loadDemoData`).
 *
 * Everything here is synthetic. Ids are fixed so tests and screenshots can name them. Times
 * are relative ("N days ago"), so the demo lots are always valid when the data is loaded.
 * This module has no imports on purpose: scripts/seed.ts runs it with plain Node.
 */

export interface DemoUser {
  id: string;
  email: string;
  locale: "en" | "pt";
  role: "user" | "admin";
  /** What the demo account is for. */
  note: string;
  /** The signup trial was granted this many days ago (0 = today). */
  trialGrantedDaysAgo: number;
}

export interface DemoProject {
  id: string;
  userId: string;
  name: string;
}

export interface DemoDocument {
  id: string;
  projectId: string;
  userId: string;
  fileName: string;
  sizeBytes: number;
  pageCount: number;
}

export interface DemoSheet {
  id: string;
  documentId: string;
  projectId: string;
  userId: string;
  pageNo: number;
  status: "uploaded" | "ready" | "unsupported_raster";
  scaleRatio: number | null;
  elementCount: number | null;
  styleCount: number | null;
  dominantShare: number | null;
}

export interface DemoGroup {
  id: string;
  sheetId: string;
  userId: string;
  styleKey: string;
  kind: "area" | "length";
  stroke: string;
  fill: string | null;
  lineWidthPt: number;
  elementCount: number;
  areaM2: number | null;
  perimeterM: number | null;
  lengthM: number | null;
  reviewState: "pending" | "confirmed" | "rejected";
  articleId: string | null;
}

export interface DemoMapNode {
  id: string;
  projectId: string;
  userId: string;
  parentId: string | null;
  kind: "chapter" | "article";
  code: string;
  title: string;
  unit: "m" | "m2" | "m3" | "un" | null;
  sortOrder: number;
}

export interface DemoPurchase {
  id: string;
  userId: string;
  kind: "pass" | "subscription";
  passSize: number | null;
  amountMinor: number;
  stripeRef: string;
  daysAgo: number;
}

export interface DemoLot {
  id: string;
  userId: string;
  purchaseId: string | null;
  origin: "subscription" | "pass";
  sheets: number;
  grantedDaysAgo: number;
  /** Days of validity counted from the grant (90 for purchases). */
  validityDays: number;
}

/** A sheet consumed from a lot: the committed reservation of a processed sheet. */
export interface DemoReservation {
  sheetId: string;
  userId: string;
  /** The lot it was charged to; null means the user's trial lot. */
  lotId: string | null;
}

export interface DemoSubscription {
  userId: string;
  stripeSubscriptionId: string;
  plan: "independente" | "empresa" | "gabinete";
  founderPrice: boolean;
}

export interface DemoTrustCheck {
  id: string;
  sheetId: string;
  userId: string;
  answer: "yes" | "almost" | "no";
  confirmedGroups: number;
}

export interface DemoFixtures {
  users: DemoUser[];
  projects: DemoProject[];
  documents: DemoDocument[];
  sheets: DemoSheet[];
  groups: DemoGroup[];
  mapNodes: DemoMapNode[];
  purchases: DemoPurchase[];
  lots: DemoLot[];
  reservations: DemoReservation[];
  subscriptions: DemoSubscription[];
  trustChecks: DemoTrustCheck[];
  founderUserIds: string[];
}

const id = (group: string, n: number) =>
  `${group}000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const ANA = id("a1", 1);
const BRUNO = id("a1", 2);
const CARLA = id("a1", 3);
const DANIEL = id("a1", 4);
const EVA = id("a1", 5);

export const demoFixtures: DemoFixtures = {
  users: [
    {
      id: ANA,
      email: "ana@demo.example.test",
      locale: "pt",
      role: "user",
      note: "Trial in progress: 1 of 5 sheets used, 2 projects",
      trialGrantedDaysAgo: 2,
    },
    {
      id: BRUNO,
      email: "bruno@demo.example.test",
      locale: "pt",
      role: "user",
      note: "Bought a Passe 60: one processed sheet, a map with one article",
      trialGrantedDaysAgo: 40,
    },
    {
      id: CARLA,
      email: "carla@demo.example.test",
      locale: "pt",
      role: "user",
      note: "Active 'Empresa' subscription at the founder price, two monthly lots",
      trialGrantedDaysAgo: 70,
    },
    {
      id: DANIEL,
      email: "daniel@demo.example.test",
      locale: "en",
      role: "user",
      note: "Trial expired and no purchase: shows the 'no sheets' state",
      trialGrantedDaysAgo: 20,
    },
    {
      id: EVA,
      email: "eva@demo.example.test",
      locale: "pt",
      role: "admin",
      note: "Service administrator (no admin interface in the MVP)",
      trialGrantedDaysAgo: 0,
    },
  ],
  projects: [
    { id: id("b1", 1), userId: ANA, name: "Moradia T3 (demonstração)" },
    { id: id("b1", 2), userId: ANA, name: "Armazém logístico (demonstração)" },
    { id: id("b1", 3), userId: BRUNO, name: "Reabilitação de escola (demonstração)" },
  ],
  documents: [
    {
      id: id("c1", 1),
      projectId: id("b1", 1),
      userId: ANA,
      fileName: "planta-piso-0-sintetica.pdf",
      sizeBytes: 184_320,
      pageCount: 2,
    },
    {
      id: id("c1", 2),
      projectId: id("b1", 2),
      userId: ANA,
      fileName: "planta-digitalizada-sintetica.pdf",
      sizeBytes: 912_000,
      pageCount: 1,
    },
    {
      id: id("c1", 3),
      projectId: id("b1", 3),
      userId: BRUNO,
      fileName: "planta-escola-sintetica.pdf",
      sizeBytes: 256_000,
      pageCount: 1,
    },
  ],
  sheets: [
    {
      id: id("d1", 1),
      documentId: id("c1", 1),
      projectId: id("b1", 1),
      userId: ANA,
      pageNo: 1,
      status: "ready",
      scaleRatio: 100,
      elementCount: 612,
      styleCount: 5,
      dominantShare: 0.41,
    },
    {
      id: id("d1", 2),
      documentId: id("c1", 1),
      projectId: id("b1", 1),
      userId: ANA,
      pageNo: 2,
      status: "uploaded",
      scaleRatio: 100,
      elementCount: null,
      styleCount: null,
      dominantShare: null,
    },
    {
      id: id("d1", 3),
      documentId: id("c1", 2),
      projectId: id("b1", 2),
      userId: ANA,
      pageNo: 1,
      status: "unsupported_raster",
      scaleRatio: null,
      elementCount: 0,
      styleCount: 0,
      dominantShare: null,
    },
    {
      id: id("d1", 4),
      documentId: id("c1", 3),
      projectId: id("b1", 3),
      userId: BRUNO,
      pageNo: 1,
      status: "ready",
      scaleRatio: 50,
      elementCount: 380,
      styleCount: 4,
      dominantShare: 0.38,
    },
  ],
  groups: [
    // The synthetic A2 sheet of US-04: 12.40 x 8.25 m room, 20+5+15 m polyline.
    {
      id: id("e1", 1),
      sheetId: id("d1", 1),
      userId: ANA,
      styleKey: "s-room",
      kind: "area",
      stroke: "#1f4e79",
      fill: "#cfe2f3",
      lineWidthPt: 0.5,
      elementCount: 1,
      areaM2: 102.3,
      perimeterM: 41.3,
      lengthM: null,
      reviewState: "pending",
      articleId: null,
    },
    {
      id: id("e1", 2),
      sheetId: id("d1", 1),
      userId: ANA,
      styleKey: "s-wall",
      kind: "length",
      stroke: "#000000",
      fill: null,
      lineWidthPt: 1.2,
      elementCount: 3,
      areaM2: null,
      perimeterM: null,
      lengthM: 40,
      reviewState: "confirmed",
      articleId: null,
    },
    {
      id: id("e1", 3),
      sheetId: id("d1", 4),
      userId: BRUNO,
      styleKey: "s-slab",
      kind: "area",
      stroke: "#7f6000",
      fill: "#fff2cc",
      lineWidthPt: 0.35,
      elementCount: 2,
      areaM2: 160,
      perimeterM: 52,
      lengthM: null,
      reviewState: "confirmed",
      articleId: id("f1", 2),
    },
  ],
  mapNodes: [
    {
      id: id("f1", 1),
      projectId: id("b1", 3),
      userId: BRUNO,
      parentId: null,
      kind: "chapter",
      code: "05",
      title: "Pavimentos",
      unit: null,
      sortOrder: 1,
    },
    {
      id: id("f1", 2),
      projectId: id("b1", 3),
      userId: BRUNO,
      parentId: id("f1", 1),
      kind: "article",
      code: "05.01",
      title: "Laje de betão armado",
      unit: "m2",
      sortOrder: 1,
    },
  ],
  purchases: [
    {
      id: id("90", 1),
      userId: BRUNO,
      kind: "pass",
      passSize: 60,
      amountMinor: 12_900,
      stripeRef: "pi_demo_bruno_pass60",
      daysAgo: 10,
    },
    {
      id: id("90", 2),
      userId: CARLA,
      kind: "subscription",
      passSize: null,
      amountMinor: 7_900,
      stripeRef: "in_demo_carla_month1",
      daysAgo: 30,
    },
    {
      id: id("90", 3),
      userId: CARLA,
      kind: "subscription",
      passSize: null,
      amountMinor: 7_900,
      stripeRef: "in_demo_carla_month2",
      daysAgo: 0,
    },
  ],
  lots: [
    {
      id: id("a0", 1),
      userId: BRUNO,
      purchaseId: id("90", 1),
      origin: "pass",
      sheets: 60,
      grantedDaysAgo: 10,
      validityDays: 90,
    },
    {
      id: id("a0", 2),
      userId: CARLA,
      purchaseId: id("90", 2),
      origin: "subscription",
      sheets: 50,
      grantedDaysAgo: 30,
      validityDays: 90,
    },
    {
      id: id("a0", 3),
      userId: CARLA,
      purchaseId: id("90", 3),
      origin: "subscription",
      sheets: 50,
      grantedDaysAgo: 0,
      validityDays: 90,
    },
  ],
  reservations: [
    // Ana's processed sheet comes out of her trial lot. Her scanned sheet was released
    // (raster) and her second page is not processed yet: neither holds a reservation.
    { sheetId: id("d1", 1), userId: ANA, lotId: null },
    { sheetId: id("d1", 4), userId: BRUNO, lotId: id("a0", 1) },
  ],
  subscriptions: [
    {
      userId: CARLA,
      stripeSubscriptionId: "sub_demo_carla",
      plan: "empresa",
      founderPrice: true,
    },
  ],
  trustChecks: [
    {
      id: id("a2", 1),
      sheetId: id("d1", 4),
      userId: BRUNO,
      answer: "yes",
      confirmedGroups: 3,
    },
  ],
  founderUserIds: [CARLA],
};

export const DEMO_TRIAL_SHEETS = 5;
export const DEMO_TRIAL_DAYS = 14;
