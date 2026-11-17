import { describe, expect, it } from "vitest";
import { getActivityImageSources } from "./activity-image";

describe("getActivityImageSources", () => {
  it("uses an activity's own image before its category fallback", () => {
    expect(
      getActivityImageSources({
        id: 1,
        name: "Yoga y meditación",
        imageUrl: "https://example.com/yoga.jpg",
        category: "Deportiva",
      }),
    ).toEqual([
      "https://example.com/yoga.jpg",
      "/images/activities/deportiva.jpg",
    ]);
  });

  it("selects the matching sports photo for yoga and volleyball", () => {
    expect(
      getActivityImageSources({
        id: 2,
        name: "Yoga y meditación",
        category: "Deportiva",
      }),
    ).toEqual(["/images/activities/deportiva.jpg"]);
    expect(
      getActivityImageSources({
        id: 1,
        name: "Voleibol mixto",
        category: "Deportiva",
      }),
    ).toEqual(["/images/activities/deportiva.png"]);
  });

  it("uses the supplied photo for recreational and workshop activities", () => {
    expect(
      getActivityImageSources({
        id: 1,
        name: "Torneo de ajedrez",
        category: "Recreativa",
      }),
    ).toEqual(["/images/activities/recreativa.png"]);
    expect(
      getActivityImageSources({
        id: 1,
        name: "Taller de fotografía",
        category: "Taller",
      }),
    ).toEqual(["/images/activities/taller.jpg"]);
  });

  it("rotates between available cultural photos by activity ID", () => {
    expect(
      getActivityImageSources({
        id: 1,
        name: "Noche de música",
        category: "Cultural",
      }),
    ).not.toEqual(
      getActivityImageSources({
        id: 2,
        name: "Coro universitario",
        category: "Cultural",
      }),
    );
  });

  it("uses the supplied photo collection for categories without a mapping", () => {
    const sources = getActivityImageSources({
      id: 1,
      name: "Actividad especial",
      category: "Otra",
    });

    expect(sources).toHaveLength(1);
    expect(sources[0]).toMatch(/^\/images\/activities\//);
  });
});
