/**
 * Synthetic drawing sheets for the measurement engine tests. Every number that a test asserts
 * is derived here from the real-world size of the drawn object and the scale of the sheet, so a
 * fixture cannot silently disagree with its expectations. Real tender drawings are never used
 * (ADR 0006: they stay out of the repository).
 */
import { Content, MM, PdfBuilder } from "./pdf-builder.ts";

/** Real-world metres to PDF points on a sheet drawn at 1:`ratio`. */
export const metresToPoints = (metres: number, ratio = 100): number =>
  ((metres * 1000) / ratio) * MM;

/** A2 portrait in points. */
const A2 = { width: 420 * MM, height: 594 * MM };
/** A1 portrait in points. */
const A1 = { width: 594 * MM, height: 841 * MM };

/** What `vectorA2()` draws, in real-world units (PRD US-04, criterion 1). */
export const VECTOR_A2 = {
  ratio: 100,
  rectangle: {
    width: 12.4,
    height: 8.25,
    area: 12.4 * 8.25,
    perimeter: 2 * (12.4 + 8.25),
  },
  polylineLength: 20 + 5 + 15,
  circle: { radius: 1.5, perimeter: 2 * Math.PI * 1.5, area: Math.PI * 1.5 * 1.5 },
  /** Stroke colours, so the test can tell the three elements apart. */
  colours: { rectangle: "#ff0000", polyline: "#0000ff", circle: "#008000" },
} as const;

/**
 * An A2 sheet at 1:100 with a 12.40 x 8.25 m rectangle (red), a 20 + 5 + 15 m polyline (blue)
 * and a circle of radius 1.50 m (green), plus the scale note a CAD export would carry.
 */
export function vectorA2(): Uint8Array {
  const c = new Content();
  const s = (m: number) => metresToPoints(m, VECTOR_A2.ratio);
  c.strokeRgb(1, 0, 0).lineWidth(0.35);
  c.rect(30 * MM, 40 * MM, s(12.4), s(8.25)).stroke();
  c.strokeRgb(0, 0, 1).lineWidth(0.5);
  const x = 30 * MM;
  const y = 200 * MM;
  c.polyline([
    [x, y],
    [x + s(20), y],
    [x + s(20), y + s(5)],
    [x + s(20) - s(15), y + s(5)],
  ]).stroke();
  c.strokeRgb(0, 0.5, 0).lineWidth(0.35);
  c.circle(200 * MM, 300 * MM, s(1.5)).stroke();
  return new PdfBuilder().addPage(A2, c).build();
}

/**
 * The same 12.40 x 8.25 m rectangle as {@link vectorA2}, drawn inside a block that is moved,
 * rotated by 30 degrees and scaled by 0.1 (how CAD exports nested blocks): spike S2.
 */
export function rotatedScaledRectangle(): Uint8Array {
  const c = new Content();
  const k = 0.1;
  const s = (m: number) => metresToPoints(m, VECTOR_A2.ratio) / k;
  c.save().translate(150, 200).rotate(30).scale(k);
  c.strokeRgb(1, 0, 0).lineWidth(0.35 / k);
  c.rect(0, 0, s(12.4), s(8.25)).stroke();
  c.restore();
  return new PdfBuilder().addPage(A2, c).build();
}

/** Real-world sizes in `slabsWithHoles()`, in metres squared. */
export const SLABS = {
  /** Even-odd, hole drawn in the same path. */
  evenOddHole: 10 * 10 - 4 * 4,
  /** Non-zero, both rings counter-clockwise: the inner ring is not a hole. */
  nonZeroSameWinding: 10 * 10,
  /** Non-zero, inner ring clockwise: a hole. */
  nonZeroOppositeWinding: 10 * 10 - 4 * 4,
  /** Even-odd, 10 m slab, 6 m courtyard, 2 m island inside the courtyard. */
  islandOuter: 10 * 10 - 6 * 6,
  islandInner: 2 * 2,
} as const;

/** Five filled elements that exercise the fill rules (spike S6). Each has its own fill colour. */
export function slabsWithHoles(): Uint8Array {
  const c = new Content();
  const s = (m: number) => metresToPoints(m, 100);
  const ccw = (x: number, y: number, side: number) => {
    c.moveTo(x, y)
      .lineTo(x + side, y)
      .lineTo(x + side, y + side)
      .lineTo(x, y + side)
      .closePath();
  };
  const cw = (x: number, y: number, side: number) => {
    c.moveTo(x, y)
      .lineTo(x, y + side)
      .lineTo(x + side, y + side)
      .lineTo(x + side, y)
      .closePath();
  };
  // (a) even-odd slab with a void
  c.fillRgb(1, 0, 0);
  ccw(50, 50, s(10));
  ccw(50 + s(3), 50 + s(3), s(4));
  c.fillEvenOdd();
  // (b) non-zero, same winding: no hole
  c.fillRgb(0, 1, 0);
  ccw(50, 300, s(10));
  ccw(50 + s(3), 300 + s(3), s(4));
  c.fill();
  // (c) non-zero, opposite winding: a hole
  c.fillRgb(0, 0, 1);
  ccw(50, 550, s(10));
  cw(50 + s(3), 550 + s(3), s(4));
  c.fill();
  // (d) even-odd: courtyard with an island (two elements)
  c.fillRgb(1, 1, 0);
  ccw(50, 800, s(10));
  ccw(50 + s(2), 800 + s(2), s(6));
  ccw(50 + s(4), 800 + s(4), s(2));
  c.fillEvenOdd();
  return new PdfBuilder().addPage(A2, c).build();
}

/** A page whose only content is one raster image (a scan or a photo): US-04 criterion 2. */
export function rasterOnly(): Uint8Array {
  const pixels = new Uint8Array(8 * 8 * 3);
  for (let i = 0; i < pixels.length; i++) pixels[i] = (i * 37) % 256;
  const builder = new PdfBuilder();
  const image = builder.addImage(8, 8, pixels);
  const c = new Content().save().scale(A1.width, A1.height).paintXObject("Im0").restore();
  return builder.addPage(A1, c, { xobjects: { Im0: image } }).build();
}

/** Needs a password to open: the engine must refuse it as encrypted (SR-05). */
export function passwordProtected(): Uint8Array {
  return new PdfBuilder()
    .addPage(A2, new Content().moveTo(0, 0).lineTo(10, 10).stroke())
    .build({ userPassword: "secret" });
}

/** A page with no content at all. */
export function blankPage(): Uint8Array {
  return new PdfBuilder().addPage(A2, new Content()).build();
}

/** Three lines of 10 m (visible layer), 20 m (hidden layer) and 5 m (no layer), at 1:100. */
export const LAYERS = { visibleLengthM: 10, hiddenLengthM: 20, plainLengthM: 5 } as const;

export function layeredSheet(): Uint8Array {
  const builder = new PdfBuilder();
  const shown = builder.addLayer("A-WALL", true);
  const hidden = builder.addLayer("A-ANNO-HIDDEN", false);
  const s = (m: number) => metresToPoints(m, 100);
  const c = new Content();
  c.strokeRgb(0, 0, 0).lineWidth(0.25);
  c.beginLayer("L1")
    .moveTo(50, 50)
    .lineTo(50 + s(LAYERS.visibleLengthM), 50)
    .stroke()
    .endLayer();
  c.beginLayer("L2")
    .moveTo(50, 100)
    .lineTo(50 + s(LAYERS.hiddenLengthM), 100)
    .stroke()
    .endLayer();
  c.moveTo(50, 150)
    .lineTo(50 + s(LAYERS.plainLengthM), 150)
    .stroke();
  return builder.addPage(A2, c, { properties: { L1: shown, L2: hidden } }).build();
}

/**
 * A form XObject (a CAD block) drawn twice with different `cm` matrices, with its own /Matrix:
 * lengths must follow the combined transformation. The block holds a 10 m horizontal line.
 */
export const BLOCKS = {
  lineLengthM: 10,
  scaleFirst: 1,
  scaleSecond: 0.5,
  formMatrixScale: 2,
} as const;

export function blockInstances(): Uint8Array {
  const builder = new PdfBuilder();
  const s = (m: number) => metresToPoints(m, 100);
  const block = new Content()
    .strokeRgb(0, 0, 0)
    .lineWidth(0.5)
    .moveTo(0, 0)
    .lineTo(s(BLOCKS.lineLengthM) / BLOCKS.formMatrixScale, 0)
    .stroke();
  const form = builder.addForm([0, 0, 2000, 100], block, {
    matrix: [BLOCKS.formMatrixScale, 0, 0, BLOCKS.formMatrixScale, 0, 0],
  });
  const c = new Content();
  c.save().translate(50, 50).scale(BLOCKS.scaleFirst).paintXObject("B1").restore();
  c.save().translate(50, 200).scale(BLOCKS.scaleSecond).paintXObject("B1").restore();
  return builder.addPage(A2, c, { xobjects: { B1: form } }).build();
}

/** A 10 x 10 m square on a page with an offset origin, a rotation and a UserUnit of 2. */
export const PAGE_BOXES = {
  side: 10,
  userUnit: 2,
  origin: [-500, -300] as const,
  rotate: 90 as const,
};

export function offsetRotatedPage(): Uint8Array {
  // At 1:100 with UserUnit 2 one point is 2 * 0.0352777 m, so a 10 m side is half the usual length.
  const side = metresToPoints(PAGE_BOXES.side, 100) / PAGE_BOXES.userUnit;
  const x = PAGE_BOXES.origin[0] + 100;
  const y = PAGE_BOXES.origin[1] + 100;
  const c = new Content()
    .strokeRgb(0, 0, 0)
    .lineWidth(0.35)
    .rect(x, y, side, side)
    .stroke();
  return new PdfBuilder()
    .addPage(
      {
        ...A2,
        origin: PAGE_BOXES.origin,
        rotate: PAGE_BOXES.rotate,
        userUnit: PAGE_BOXES.userUnit,
      },
      c,
    )
    .build();
}

/** How open and closed shapes are told apart (M4): metres at 1:100. */
export const SHAPES = { side: 5, gap: 1 } as const;

export function openAndClosedShapes(): Uint8Array {
  const s = (m: number) => metresToPoints(m, 100);
  const side = s(SHAPES.side);
  const c = new Content().strokeRgb(0, 0, 0).lineWidth(0.35);
  // 1: explicit close (h)
  c.polyline([
    [50, 50],
    [50 + side, 50],
    [50 + side, 50 + side],
    [50, 50 + side],
  ])
    .closePath()
    .stroke();
  // 2: returns to its start without h
  c.polyline([
    [50, 200],
    [50 + side, 200],
    [50 + side, 200 + side],
    [50, 200 + side],
    [50, 200],
  ]).stroke();
  // 3: `s` (close and stroke)
  c.polyline([
    [50, 350],
    [50 + side, 350],
    [50 + side, 350 + side],
    [50, 350 + side],
  ]).closeStroke();
  // 4: a gap of 1 m between the last point and the first: an open polyline
  c.polyline([
    [50, 500],
    [50 + side, 500],
    [50 + side, 500 + side],
    [50, 500 + side],
    [50, 500 + s(SHAPES.gap)],
  ]).stroke();
  // 5: a rectangle that is filled but not stroked (fill closes implicitly)
  c.fillRgb(0.5, 0.5, 0.5);
  c.polyline([
    [300, 50],
    [300 + side, 50],
    [300 + side, 50 + side],
    [300, 50 + side],
  ]).fill();
  return new PdfBuilder().addPage(A2, c).build();
}

/** A deterministic pseudo-random generator (mulberry32): fixtures must not change between runs. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PenStyle {
  stroke: [number, number, number];
  width: number;
  dash: number[];
  /** Fill colour for the polygons of this style, or null for outlines only. */
  fill: [number, number, number] | null;
}

/** Six pens; odd ones fill their polygons. */
export const PENS: readonly PenStyle[] = [
  { stroke: [1, 0, 0], width: 0.18, dash: [], fill: null },
  { stroke: [0, 0, 1], width: 0.25, dash: [3, 2], fill: [0.8, 0.8, 1] },
  { stroke: [0, 0.5, 0], width: 0.35, dash: [], fill: null },
  { stroke: [0.5, 0, 0.5], width: 0.5, dash: [6, 2, 1, 2], fill: [1, 0.8, 1] },
  { stroke: [0, 0.5, 0.5], width: 0.7, dash: [], fill: null },
  { stroke: [0.3, 0.3, 0.3], width: 1, dash: [2, 2], fill: [0.9, 0.9, 0.9] },
];

export interface BigSheetOptions {
  elements: number;
  seed: number;
  /** Pen index of element `i`, given a random number in [0, 1). */
  penOf: (index: number, random: number) => number;
}

/** An A1 sheet with `elements` painted elements in the six {@link PENS}. */
export function bigSheet(options: BigSheetOptions): Uint8Array {
  const random = seededRandom(options.seed);
  const c = new Content();
  let current = -1;
  for (let i = 0; i < options.elements; i++) {
    const pen = PENS[options.penOf(i, random()) % PENS.length] as PenStyle;
    const penIndex = PENS.indexOf(pen);
    if (penIndex !== current) {
      c.strokeRgb(...pen.stroke)
        .lineWidth(pen.width)
        .dash(pen.dash);
      if (pen.fill) c.fillRgb(...pen.fill);
      current = penIndex;
    }
    const x = 10 * MM + random() * 560 * MM;
    const y = 10 * MM + random() * 800 * MM;
    const kind = random();
    if (kind < 0.5) {
      c.moveTo(x, y)
        .lineTo(x + (1 + random() * 19) * MM, y + (random() * 10 - 5) * MM)
        .stroke();
    } else if (kind < 0.8) {
      c.rect(x, y, (1 + random() * 9) * MM, (1 + random() * 9) * MM);
      if (pen.fill) c.fillStroke();
      else c.stroke();
    } else {
      c.moveTo(x, y);
      for (let k = 0; k < 3; k++)
        c.lineTo(x + (random() * 16 - 8) * MM, y + (random() * 16 - 8) * MM);
      c.closePath();
      if (pen.fill) c.fillStroke();
      else c.stroke();
    }
  }
  return new PdfBuilder({ compress: true }).addPage(A1, c).build();
}

/** 50 000 elements spread evenly over the six pens (US-04 criterion 3). */
export function evenSheet50k(): Uint8Array {
  return bigSheet({ elements: 50_000, seed: 7, penOf: (i) => i % PENS.length });
}

/**
 * 38 000 elements, 95 % of them lines in pen 0: the "poor CAD style" sheet of US-04 criterion 6.
 * Every 20th element goes to one of the other five pens, so the share is exactly 0.95.
 */
export function poorStyleSheet38k(): Uint8Array {
  return bigSheet({
    elements: 38_000,
    seed: 11,
    penOf: (i) => (i % 20 === 0 ? 1 + ((i / 20) % 5) : 0),
  });
}

/** The small sheets committed as `fixtures/<name>.pdf` (plain ASCII, reproducible byte for byte). */
export const COMMITTED_FIXTURES: Readonly<Record<string, () => Uint8Array>> = {
  "vector-a2.pdf": vectorA2,
  "rotated-scaled-rectangle.pdf": rotatedScaledRectangle,
  "slabs-with-holes.pdf": slabsWithHoles,
  "raster-only.pdf": rasterOnly,
  "blank-page.pdf": blankPage,
  "layers.pdf": layeredSheet,
  "block-instances.pdf": blockInstances,
  "offset-rotated-page.pdf": offsetRotatedPage,
  "open-and-closed-shapes.pdf": openAndClosedShapes,
};
