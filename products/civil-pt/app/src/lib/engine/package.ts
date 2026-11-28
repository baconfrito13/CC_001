import { z } from "zod";
import { EngineError } from "./errors";
import {
  ElementKind,
  type ElementTable,
  type ExtractedSheet,
  type GroupAssignment,
  NO_GROUP,
} from "./types";

/**
 * Geometry package v1 (ADR 0005): what the executor stores in the private `geometry` bucket and
 * the viewer draws highlights from. It holds the geometry of one sheet and the element to group
 * map, independent of which grouping strategy filled it.
 *
 * Layout (all integers little-endian; every binary section starts on an 8-byte boundary):
 *
 *     0  4  magic "RGEO"
 *     4  2  format version (1)
 *     6  2  reserved (0)
 *     8  4  header length H in bytes
 *    12  H  UTF-8 JSON header (page, scale, styles, groups, stats, counts), validated with zod
 *     .  .  padding to 8, then the sections in this order, each padded to 8:
 *           elementGroup  u32 [elements]      group of each element (0xFFFFFFFF = none)
 *           elementKind   u8  [elements]      0 polyline, 1 polygon
 *           elementStyle  u32 [elements]      index into header.styles
 *           elementArea   f64 [elements]      m², net of holes
 *           elementLength f64 [elements]      m, polyline length or polygon perimeter
 *           ringStart     u32 [elements + 1]  first ring of each element (outer ring first)
 *           vertexStart   u32 [rings + 1]     first vertex of each ring
 *           coords        f32 [2 * vertices]  x, y in page points minus the page origin
 *
 * The layout is derived from `header.counts`, so a package cannot point outside itself.
 * A different layout means a new version number; readers refuse versions they do not know.
 */
export const PACKAGE_VERSION = 1;

const MAGIC = [0x52, 0x47, 0x45, 0x4f]; // "RGEO"
const PREFIX_BYTES = 12;

/** Largest package a reader will inflate: 500 000 elements and 20 million vertices fit well below. */
export const DEFAULT_MAX_UNCOMPRESSED_BYTES = 512 * 1024 * 1024;

const uint = z.number().int().nonnegative();

const headerSchema = z.object({
  format: z.literal("rastoplan-geometry"),
  version: z.literal(PACKAGE_VERSION),
  strategy: z.enum(["style", "selection"]),
  page: z.object({
    pageNo: z.number().int().min(1),
    widthPt: z.number(),
    heightPt: z.number(),
    view: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    rotate: z.number(),
    userUnit: z.number(),
  }),
  scale: z.object({ ratio: z.number(), metersPerPoint: z.number() }),
  styles: z.array(
    z.object({
      stroke: z.string().nullable(),
      fill: z.string().nullable(),
      widthPt: z.number(),
      dash: z.array(z.number()),
      dashPhase: z.number(),
    }),
  ),
  groups: z.array(
    z.object({
      id: uint,
      kind: z.enum(["polygon", "polyline", "mixed"]),
      styleId: uint.nullable(),
      label: z.string().nullable(),
      count: uint,
      areaM2: z.number(),
      lengthM: z.number(),
      bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).nullable(),
    }),
  ),
  stats: z.object({
    operators: uint,
    paths: uint,
    elements: uint,
    polygons: uint,
    polylines: uint,
    holes: uint,
    vertices: uint,
    images: uint,
    imageAreaShare: z.number(),
    clipOperations: uint,
    hiddenPaths: uint,
    degenerateSubpaths: uint,
    nestingSkippedPaths: uint,
    durationMs: z.number(),
  }),
  counts: z.object({ elements: uint, rings: uint, vertices: uint }),
});

type PackageHeader = z.infer<typeof headerSchema>;

interface SectionSpec {
  name: string;
  bytesPerItem: number;
  items(counts: PackageHeader["counts"]): number;
}

const SECTIONS: readonly SectionSpec[] = [
  { name: "elementGroup", bytesPerItem: 4, items: (c) => c.elements },
  { name: "elementKind", bytesPerItem: 1, items: (c) => c.elements },
  { name: "elementStyle", bytesPerItem: 4, items: (c) => c.elements },
  { name: "elementArea", bytesPerItem: 8, items: (c) => c.elements },
  { name: "elementLength", bytesPerItem: 8, items: (c) => c.elements },
  { name: "ringStart", bytesPerItem: 4, items: (c) => c.elements + 1 },
  { name: "vertexStart", bytesPerItem: 4, items: (c) => c.rings + 1 },
  { name: "coords", bytesPerItem: 4, items: (c) => 2 * c.vertices },
];

const align8 = (n: number): number => (n + 7) & ~7;

function assertLittleEndian(): void {
  if (new Uint8Array(new Uint16Array([1]).buffer)[0] !== 1) {
    throw new EngineError(
      "invalid_package",
      "Geometry packages need a little-endian platform",
    );
  }
}

/** Section byte offsets relative to the start of the data region, and its total size. */
function layout(counts: PackageHeader["counts"]): {
  offsets: number[];
  byteLength: number;
} {
  const offsets: number[] = [];
  let cursor = 0;
  for (const section of SECTIONS) {
    cursor = align8(cursor);
    offsets.push(cursor);
    cursor += section.items(counts) * section.bytesPerItem;
  }
  return { offsets, byteLength: cursor };
}

const invalid = (message: string, cause?: unknown): EngineError =>
  new EngineError(
    "invalid_package",
    message,
    cause === undefined ? undefined : { cause },
  );

export function encodeGeometryPackage(
  sheet: ExtractedSheet,
  assignment: GroupAssignment,
): Uint8Array {
  assertLittleEndian();
  const table = sheet.elements;
  const counts = {
    elements: table.count,
    rings: table.vertexStart.length - 1,
    vertices: table.coords.length / 2,
  };
  const header: PackageHeader = {
    format: "rastoplan-geometry",
    version: PACKAGE_VERSION,
    strategy: assignment.strategy,
    page: sheet.page,
    scale: sheet.scale,
    styles: sheet.styles.map((s) => ({ ...s, dash: [...s.dash] })),
    groups: assignment.groups,
    stats: sheet.stats,
    counts,
  };
  const headerBytes = new TextEncoder().encode(JSON.stringify(header));
  const dataStart = align8(PREFIX_BYTES + headerBytes.length);
  const { offsets, byteLength } = layout(counts);
  const out = new Uint8Array(dataStart + byteLength);
  const view = new DataView(out.buffer);
  out.set(MAGIC, 0);
  view.setUint16(4, PACKAGE_VERSION, true);
  view.setUint16(6, 0, true);
  view.setUint32(8, headerBytes.length, true);
  out.set(headerBytes, PREFIX_BYTES);

  const arrays: ArrayBufferView[] = [
    assignment.groupOf,
    table.kind,
    table.style,
    table.area,
    table.length,
    table.ringStart,
    table.vertexStart,
    table.coords,
  ];
  arrays.forEach((array, index) => {
    out.set(
      new Uint8Array(array.buffer, array.byteOffset, array.byteLength),
      dataStart + (offsets[index] as number),
    );
  });
  return out;
}

export interface GeometryPackage {
  sheet: ExtractedSheet;
  assignment: GroupAssignment;
}

/** Reads and validates a package. The arrays of the result are views over `bytes` (or a copy of it). */
export function decodeGeometryPackage(input: Uint8Array): GeometryPackage {
  assertLittleEndian();
  if (input.length < PREFIX_BYTES) throw invalid("Geometry package is too short");
  // Typed-array views need aligned offsets; a Buffer slice or a subarray may not be.
  const bytes = input.byteOffset % 8 === 0 ? input : input.slice();
  if (MAGIC.some((byte, i) => bytes[i] !== byte))
    throw invalid("Not a geometry package (bad magic)");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint16(4, true);
  if (version !== PACKAGE_VERSION) {
    throw new EngineError(
      "unsupported_package_version",
      `Geometry package version ${version} is not supported`,
    );
  }
  const headerLength = view.getUint32(8, true);
  if (PREFIX_BYTES + headerLength > bytes.length)
    throw invalid("Geometry package header is truncated");

  let header: PackageHeader;
  try {
    const json: unknown = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(
        bytes.subarray(PREFIX_BYTES, PREFIX_BYTES + headerLength),
      ),
    );
    header = headerSchema.parse(json);
  } catch (error) {
    throw invalid("Geometry package header is not valid", error);
  }

  const dataStart = align8(PREFIX_BYTES + headerLength);
  const { offsets, byteLength } = layout(header.counts);
  if (dataStart + byteLength !== bytes.length) {
    throw invalid("Geometry package size does not match its header");
  }
  const at = (index: number): number =>
    bytes.byteOffset + dataStart + (offsets[index] as number);
  const { elements, rings, vertices } = header.counts;
  const groupOf = new Uint32Array(bytes.buffer, at(0), elements);
  const table: ElementTable = {
    count: elements,
    kind: new Uint8Array(bytes.buffer, at(1), elements),
    style: new Uint32Array(bytes.buffer, at(2), elements),
    area: new Float64Array(bytes.buffer, at(3), elements),
    length: new Float64Array(bytes.buffer, at(4), elements),
    ringStart: new Uint32Array(bytes.buffer, at(5), elements + 1),
    vertexStart: new Uint32Array(bytes.buffer, at(6), rings + 1),
    coords: new Float32Array(bytes.buffer, at(7), 2 * vertices),
  };
  validateConsistency(header, table, groupOf);

  return {
    sheet: {
      page: header.page,
      scale: header.scale,
      styles: header.styles,
      elements: table,
      stats: header.stats,
    },
    assignment: { strategy: header.strategy, groupOf, groups: header.groups },
  };
}

function validateOffsets(offsets: Uint32Array, last: number, what: string): void {
  if (offsets[0] !== 0 || offsets[offsets.length - 1] !== last)
    throw invalid(`${what} offsets do not span the data`);
  for (let i = 1; i < offsets.length; i++) {
    if ((offsets[i] as number) < (offsets[i - 1] as number))
      throw invalid(`${what} offsets are not increasing`);
  }
}

function validateConsistency(
  header: PackageHeader,
  table: ElementTable,
  groupOf: Uint32Array,
): void {
  const { rings, vertices } = header.counts;
  validateOffsets(table.ringStart, rings, "Ring");
  validateOffsets(table.vertexStart, vertices, "Vertex");
  header.groups.forEach((group, index) => {
    if (group.id !== index) throw invalid("Group ids do not match their position");
  });
  for (let e = 0; e < table.count; e++) {
    const kind = table.kind[e];
    if (kind !== ElementKind.polyline && kind !== ElementKind.polygon)
      throw invalid(`Element ${e} has an unknown kind`);
    if ((table.style[e] as number) >= header.styles.length)
      throw invalid(`Element ${e} has an unknown style`);
    const group = groupOf[e] as number;
    if (group !== NO_GROUP && group >= header.groups.length)
      throw invalid(`Element ${e} has an unknown group`);
  }
}

function streamOf(bytes: Uint8Array): ReadableStream<Uint8Array<ArrayBuffer>> {
  return new ReadableStream<Uint8Array<ArrayBuffer>>({
    start(controller) {
      // `new Uint8Array(view)` copies into a plain ArrayBuffer, which is what BufferSource wants.
      controller.enqueue(new Uint8Array(bytes));
      controller.close();
    },
  });
}

async function readAll(
  stream: ReadableStream<Uint8Array>,
  maxBytes: number,
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) {
      await reader.cancel();
      throw invalid(`Geometry package is larger than ${maxBytes} bytes once inflated`);
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** gzip with the platform's Web Streams API, so the browser viewer and the server share code. */
export async function gzipPackage(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = streamOf(bytes).pipeThrough(new CompressionStream("gzip"));
  return readAll(stream, Number.POSITIVE_INFINITY);
}

export async function gunzipPackage(
  bytes: Uint8Array,
  options: { maxBytes?: number } = {},
): Promise<Uint8Array> {
  const stream = streamOf(bytes).pipeThrough(new DecompressionStream("gzip"));
  try {
    return await readAll(stream, options.maxBytes ?? DEFAULT_MAX_UNCOMPRESSED_BYTES);
  } catch (error) {
    if (error instanceof EngineError) throw error;
    throw invalid("Geometry package is not valid gzip data", error);
  }
}
