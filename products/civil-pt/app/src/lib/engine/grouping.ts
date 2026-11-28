import { EngineError } from "./errors";
import {
  ElementKind,
  type ElementTable,
  type GroupAssignment,
  type GroupInfo,
  type GroupingStrategyId,
  type GroupKind,
  NO_GROUP,
  type StyleDescriptor,
} from "./types";

/**
 * A grouping strategy only fills the element to group map (ADR 0006): the geometry package is
 * the same whichever strategy ran, so moving from style groups (path A) to hand-made selections
 * (path B, US-20) reuses the extraction, the quantities and the stored geometry.
 */
export interface GroupingStrategy {
  readonly id: GroupingStrategyId;
  assign(table: ElementTable, styles: readonly StyleDescriptor[]): GroupAssignment;
}

interface Accumulator {
  count: number;
  polygons: number;
  area: number;
  length: number;
  bbox: [number, number, number, number] | null;
}

function emptyAccumulator(): Accumulator {
  return { count: 0, polygons: 0, area: 0, length: 0, bbox: null };
}

function addElement(acc: Accumulator, table: ElementTable, element: number): void {
  acc.count += 1;
  if (table.kind[element] === ElementKind.polygon) acc.polygons += 1;
  acc.area += table.area[element] as number;
  acc.length += table.length[element] as number;
  const firstVertex = table.vertexStart[table.ringStart[element] as number] as number;
  const endVertex = table.vertexStart[table.ringStart[element + 1] as number] as number;
  let box = acc.bbox;
  for (let v = firstVertex; v < endVertex; v++) {
    const x = table.coords[2 * v] as number;
    const y = table.coords[2 * v + 1] as number;
    if (box === null) {
      box = [x, y, x, y];
    } else {
      if (x < box[0]) box[0] = x;
      if (y < box[1]) box[1] = y;
      if (x > box[2]) box[2] = x;
      if (y > box[3]) box[3] = y;
    }
  }
  acc.bbox = box;
}

function kindOf(acc: Accumulator): GroupKind {
  if (acc.polygons === acc.count) return "polygon";
  return acc.polygons === 0 ? "polyline" : "mixed";
}

function toGroup(
  id: number,
  acc: Accumulator,
  styleId: number | null,
  label: string | null,
): GroupInfo {
  return {
    id,
    kind: kindOf(acc),
    styleId,
    label,
    count: acc.count,
    areaM2: acc.area,
    lengthM: acc.length,
    bbox: acc.bbox,
  };
}

/**
 * Path A: one group per (style, kind). Polygons come before polylines, bigger groups before
 * smaller ones, and ties break on the style id, so the order is stable between runs.
 */
export const styleStrategy: GroupingStrategy = {
  id: "style",
  assign(table) {
    type Bucket = Accumulator & { styleId: number; kindCode: number; slot: number };
    const buckets = new Map<number, Bucket>();
    const slotOf = new Uint32Array(table.count);
    for (let e = 0; e < table.count; e++) {
      const styleId = table.style[e] as number;
      const kindCode = table.kind[e] as number;
      const key = styleId * 2 + kindCode;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { ...emptyAccumulator(), styleId, kindCode, slot: buckets.size };
        buckets.set(key, bucket);
      }
      addElement(bucket, table, e);
      slotOf[e] = bucket.slot;
    }
    const ordered = [...buckets.values()].sort(
      (a, b) => b.kindCode - a.kindCode || b.count - a.count || a.styleId - b.styleId,
    );
    // Group id of each bucket slot, after sorting.
    const rank = new Uint32Array(ordered.length);
    ordered.forEach((bucket, position) => {
      rank[bucket.slot] = position;
    });
    const groupOf = new Uint32Array(table.count);
    for (let e = 0; e < table.count; e++)
      groupOf[e] = rank[slotOf[e] as number] as number;
    return {
      strategy: "style",
      groupOf,
      groups: ordered.map((bucket, id) => toGroup(id, bucket, bucket.styleId, null)),
    };
  },
};

/** A set of elements the user picked (click, region): US-20 on path B. */
export interface Selection {
  label?: string;
  /** Element indexes (positions in the element table). */
  elements: ArrayLike<number>;
}

/**
 * Path B: one group per selection, in the order given; everything not selected stays
 * {@link NO_GROUP}. Indexes are validated here because they come from the browser.
 */
export function selectionStrategy(selections: readonly Selection[]): GroupingStrategy {
  return {
    id: "selection",
    assign(table) {
      const groupOf = new Uint32Array(table.count).fill(NO_GROUP);
      const groups: GroupInfo[] = [];
      selections.forEach((selection, id) => {
        if (selection.elements.length === 0) {
          throw new EngineError("invalid_selection", `Selection ${id} is empty`);
        }
        const acc = emptyAccumulator();
        for (let k = 0; k < selection.elements.length; k++) {
          const element = selection.elements[k] as number;
          if (!Number.isInteger(element) || element < 0 || element >= table.count) {
            throw new EngineError(
              "invalid_selection",
              `Selection ${id} names element ${element}, which does not exist`,
            );
          }
          if (groupOf[element] !== NO_GROUP) {
            throw new EngineError(
              "invalid_selection",
              `Element ${element} is selected more than once`,
            );
          }
          groupOf[element] = id;
          addElement(acc, table, element);
        }
        groups.push(toGroup(id, acc, null, selection.label ?? null));
      });
      return { strategy: "selection", groupOf, groups };
    },
  };
}

/** The biggest group's share of all elements (0 for an empty sheet). */
export function dominantShare(
  assignment: GroupAssignment,
  totalElements: number,
): number {
  if (totalElements === 0) return 0;
  let biggest = 0;
  for (const group of assignment.groups) if (group.count > biggest) biggest = group.count;
  return biggest / totalElements;
}

/**
 * The most common style's share of all elements, whatever the element kinds: metric M2 of the
 * G-GEO gate ("% of the elements in the biggest style group") and the quantity the low-diversity
 * refusal (US-04 criterion 6) compares with `LOW_DIVERSITY_SHARE`.
 */
export function dominantStyleShare(table: ElementTable): number {
  if (table.count === 0) return 0;
  const counts = new Map<number, number>();
  let biggest = 0;
  for (let e = 0; e < table.count; e++) {
    const style = table.style[e] as number;
    const next = (counts.get(style) ?? 0) + 1;
    counts.set(style, next);
    if (next > biggest) biggest = next;
  }
  return biggest / table.count;
}
