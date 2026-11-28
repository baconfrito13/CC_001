import { describe, expect, it } from "vitest";
import { EngineError } from "@/lib/engine/errors";
import { dominantShare, selectionStrategy, styleStrategy } from "@/lib/engine/grouping";
import { NO_GROUP } from "@/lib/engine/types";
import { line, sheetFrom, square, style } from "./support";

const styles = [style("#ff0000"), style("#0000ff", "#cccccc"), style("#00ff00")];

describe("engine/grouping", () => {
  it("engine: the style strategy makes one group per style and kind, polygons first, biggest first", () => {
    const sheet = sheetFrom(
      [
        square(0, 0, 1, 0),
        square(5, 0, 2, 0),
        square(10, 0, 3, 0),
        line(0, 20, 3, 4, 0),
        line(0, 30, 6, 8, 0),
        square(50, 50, 4, 1),
      ],
      styles,
    );
    const { groups, groupOf } = styleStrategy.assign(sheet.elements, sheet.styles);
    expect(groups.map((g) => [g.kind, g.styleId, g.count])).toEqual([
      ["polygon", 0, 3],
      ["polygon", 1, 1],
      ["polyline", 0, 2],
    ]);
    expect(Array.from(groupOf)).toEqual([0, 0, 0, 2, 2, 1]);
    expect(groups[0]?.areaM2).toBe(1 + 4 + 9);
    expect(groups[0]?.lengthM).toBe(4 + 8 + 12);
    expect(groups[2]?.lengthM).toBe(5 + 10);
    expect(groups[2]?.areaM2).toBe(0);
    expect(groups.map((g) => g.id)).toEqual([0, 1, 2]);
  });

  it("engine: a group's bounding box covers all its elements (table coordinates)", () => {
    const sheet = sheetFrom([square(10, 20, 5, 0), square(40, 60, 2, 0)], styles);
    const [group] = styleStrategy.assign(sheet.elements, sheet.styles).groups;
    expect(group?.bbox).toEqual([10, 20, 42, 62]);
  });

  it("engine: ties in count are broken by style id, so the order is deterministic", () => {
    const sheet = sheetFrom([square(0, 0, 1, 2), square(3, 0, 1, 1)], styles);
    const { groups } = styleStrategy.assign(sheet.elements, sheet.styles);
    expect(groups.map((g) => g.styleId)).toEqual([1, 2]);
  });

  it("engine: an empty sheet has no groups", () => {
    const sheet = sheetFrom([], styles);
    const result = styleStrategy.assign(sheet.elements, sheet.styles);
    expect(result.groups).toEqual([]);
    expect(result.groupOf.length).toBe(0);
    expect(dominantShare(result, 0)).toBe(0);
  });

  it("engine: the dominant share is the biggest group over all elements", () => {
    const elements = [
      ...Array.from({ length: 95 }, (_, i) => square(i, 0, 1, 0)),
      ...Array.from({ length: 5 }, (_, i) => square(i, 10, 1, 1)),
    ];
    const sheet = sheetFrom(elements, styles);
    const result = styleStrategy.assign(sheet.elements, sheet.styles);
    expect(dominantShare(result, sheet.elements.count)).toBe(0.95);
  });

  it('engine: GroupingStrategy "style" and "selection" fill the same element→group map', () => {
    const sheet = sheetFrom(
      [
        square(0, 0, 1, 0),
        line(0, 5, 3, 4, 0),
        square(9, 9, 2, 1),
        square(20, 0, 3, 0),
        line(1, 1, 6, 8, 2),
      ],
      styles,
    );
    const byStyle = styleStrategy.assign(sheet.elements, sheet.styles);
    // What the user would select by hand (US-20), group by group.
    const selections = byStyle.groups.map((group) => ({
      elements: Array.from(byStyle.groupOf).flatMap((g, element) =>
        g === group.id ? [element] : [],
      ),
    }));
    const bySelection = selectionStrategy(selections).assign(
      sheet.elements,
      sheet.styles,
    );
    expect(Array.from(bySelection.groupOf)).toEqual(Array.from(byStyle.groupOf));
    expect(
      bySelection.groups.map((g) => [g.kind, g.count, g.areaM2, g.lengthM, g.bbox]),
    ).toEqual(byStyle.groups.map((g) => [g.kind, g.count, g.areaM2, g.lengthM, g.bbox]));
    expect(byStyle.strategy).toBe("style");
    expect(bySelection.strategy).toBe("selection");
  });

  it("engine: elements outside every selection stay ungrouped and out of the totals", () => {
    const sheet = sheetFrom(
      [square(0, 0, 1, 0), square(3, 0, 2, 0), line(0, 9, 3, 4, 0)],
      styles,
    );
    const result = selectionStrategy([{ label: "Slab", elements: [1] }]).assign(
      sheet.elements,
      sheet.styles,
    );
    expect(Array.from(result.groupOf)).toEqual([NO_GROUP, 0, NO_GROUP]);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({
      label: "Slab",
      kind: "polygon",
      count: 1,
      areaM2: 4,
      styleId: null,
    });
  });

  it("engine: a selection that mixes polygons and lines is a mixed group with both totals", () => {
    const sheet = sheetFrom([square(0, 0, 2, 0), line(0, 9, 3, 4, 0)], styles);
    const [group] = selectionStrategy([{ elements: [0, 1] }]).assign(
      sheet.elements,
      sheet.styles,
    ).groups;
    expect(group).toMatchObject({ kind: "mixed", count: 2, areaM2: 4, lengthM: 8 + 5 });
  });

  it.each([
    ["an index past the end", [{ elements: [5] }]],
    ["a negative index", [{ elements: [-1] }]],
    ["a fractional index", [{ elements: [0.5] }]],
    ["the same element twice in one selection", [{ elements: [0, 0] }]],
    ["the same element in two selections", [{ elements: [0] }, { elements: [0] }]],
    ["an empty selection", [{ elements: [] }]],
  ])("engine: rejects %s with invalid_selection", (_name, selections) => {
    const sheet = sheetFrom([square(0, 0, 1, 0), square(3, 0, 1, 0)], styles);
    try {
      selectionStrategy(selections).assign(sheet.elements, sheet.styles);
      expect.unreachable("expected the selection to be rejected");
    } catch (error) {
      expect(error).toBeInstanceOf(EngineError);
      expect((error as EngineError).code).toBe("invalid_selection");
    }
  });
});
