const CATEGORY_PHOTOS = {
  recreativa: ["/images/activities/recreativa.png"],
  deportiva: [
    "/images/activities/deportiva.jpg",
    "/images/activities/deportiva.png",
  ],
  taller: ["/images/activities/taller.jpg"],
  cultural: [
    "/images/activities/cultural.png",
    "/images/activities/cultural%202.png",
  ],
} as const;

const CATEGORY_MATCHERS = [
  { key: "recreativa", keyword: "recreat" },
  { key: "deportiva", keyword: "deport" },
  { key: "taller", keyword: "taller" },
  { key: "cultural", keyword: "cultur" },
] as const;

const ALL_PHOTOS = Object.values(CATEGORY_PHOTOS).flat();

export interface ActivityImageInput {
  id: number;
  name: string;
  imageUrl?: string | null;
  category?: string | null;
}

function fallbackForActivity(
  id: number,
  category?: string | null,
  name = "",
): string {
  const normalizedCategory = category?.toLowerCase() ?? "";
  const normalizedName = name.toLowerCase();
  const categoryKey = CATEGORY_MATCHERS.find(({ keyword }) =>
    normalizedCategory.includes(keyword),
  )?.key;
  const photos = categoryKey ? CATEGORY_PHOTOS[categoryKey] : ALL_PHOTOS;

  if (
    categoryKey === "deportiva" &&
    /yoga|meditaci[oó]n/.test(normalizedName)
  ) {
    return CATEGORY_PHOTOS.deportiva[0];
  }
  if (
    categoryKey === "deportiva" &&
    /voleibol|volleyball/.test(normalizedName)
  ) {
    return CATEGORY_PHOTOS.deportiva[1];
  }

  return photos[Math.abs(id) % photos.length] ?? CATEGORY_PHOTOS.recreativa[0];
}

export function getActivityImageSources({
  id,
  name,
  imageUrl,
  category,
}: ActivityImageInput): string[] {
  const fallback = fallbackForActivity(id, category, name);
  return [
    ...new Set(
      [imageUrl, fallback].filter((source): source is string => Boolean(source)),
    ),
  ];
}
