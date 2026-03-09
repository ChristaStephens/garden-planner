const PLANTING_TIMING: Record<string, { startIndoors?: number; directSow: number; harvestWeeks: number; coldHardy: boolean }> = {
  "Tomato":       { startIndoors: -6, directSow: 2, harvestWeeks: 12, coldHardy: false },
  "Basil":        { startIndoors: -4, directSow: 2, harvestWeeks: 8, coldHardy: false },
  "Carrot":       { directSow: -2, harvestWeeks: 10, coldHardy: true },
  "Marigold":     { startIndoors: -6, directSow: 1, harvestWeeks: 10, coldHardy: false },
  "Lettuce":      { directSow: -4, harvestWeeks: 6, coldHardy: true },
  "Pepper":       { startIndoors: -8, directSow: 2, harvestWeeks: 14, coldHardy: false },
  "Cucumber":     { startIndoors: -3, directSow: 2, harvestWeeks: 9, coldHardy: false },
  "Zucchini":     { startIndoors: -3, directSow: 2, harvestWeeks: 8, coldHardy: false },
  "Squash":       { startIndoors: -3, directSow: 2, harvestWeeks: 12, coldHardy: false },
  "Pumpkin":      { startIndoors: -3, directSow: 2, harvestWeeks: 16, coldHardy: false },
  "Corn":         { directSow: 1, harvestWeeks: 12, coldHardy: false },
  "Bean":         { directSow: 1, harvestWeeks: 8, coldHardy: false },
  "Pea":          { directSow: -4, harvestWeeks: 8, coldHardy: true },
  "Onion":        { startIndoors: -8, directSow: -4, harvestWeeks: 16, coldHardy: true },
  "Garlic":       { directSow: -4, harvestWeeks: 32, coldHardy: true },
  "Potato":       { directSow: -2, harvestWeeks: 14, coldHardy: true },
  "Sweet Potato": { startIndoors: -6, directSow: 3, harvestWeeks: 16, coldHardy: false },
  "Broccoli":     { startIndoors: -6, directSow: -2, harvestWeeks: 10, coldHardy: true },
  "Cauliflower":  { startIndoors: -6, directSow: -2, harvestWeeks: 11, coldHardy: true },
  "Cabbage":      { startIndoors: -6, directSow: -2, harvestWeeks: 12, coldHardy: true },
  "Kale":         { directSow: -4, harvestWeeks: 8, coldHardy: true },
  "Spinach":      { directSow: -6, harvestWeeks: 6, coldHardy: true },
  "Radish":       { directSow: -4, harvestWeeks: 4, coldHardy: true },
  "Beet":         { directSow: -2, harvestWeeks: 8, coldHardy: true },
  "Turnip":       { directSow: -4, harvestWeeks: 8, coldHardy: true },
  "Celery":       { startIndoors: -10, directSow: 0, harvestWeeks: 16, coldHardy: false },
  "Asparagus":    { directSow: -2, harvestWeeks: 104, coldHardy: true },
  "Eggplant":     { startIndoors: -8, directSow: 3, harvestWeeks: 12, coldHardy: false },
  "Watermelon":   { startIndoors: -3, directSow: 2, harvestWeeks: 12, coldHardy: false },
  "Cantaloupe":   { startIndoors: -3, directSow: 2, harvestWeeks: 12, coldHardy: false },
  "Strawberry":   { directSow: -2, harvestWeeks: 8, coldHardy: true },
  "Rosemary":     { startIndoors: -8, directSow: 1, harvestWeeks: 12, coldHardy: false },
  "Thyme":        { startIndoors: -6, directSow: 0, harvestWeeks: 10, coldHardy: true },
  "Oregano":      { startIndoors: -6, directSow: 0, harvestWeeks: 10, coldHardy: true },
  "Parsley":      { startIndoors: -6, directSow: -2, harvestWeeks: 10, coldHardy: true },
  "Cilantro":     { directSow: -2, harvestWeeks: 6, coldHardy: true },
  "Dill":         { directSow: 0, harvestWeeks: 8, coldHardy: false },
  "Mint":         { startIndoors: -6, directSow: 0, harvestWeeks: 8, coldHardy: true },
  "Chives":       { startIndoors: -6, directSow: -2, harvestWeeks: 8, coldHardy: true },
  "Sage":         { startIndoors: -6, directSow: 0, harvestWeeks: 10, coldHardy: true },
  "Lavender":     { startIndoors: -8, directSow: 1, harvestWeeks: 12, coldHardy: true },
  "Sunflower":    { directSow: 1, harvestWeeks: 10, coldHardy: false },
  "Zinnia":       { directSow: 1, harvestWeeks: 8, coldHardy: false },
  "Nasturtium":   { directSow: 0, harvestWeeks: 8, coldHardy: false },
  "Cosmos":       { directSow: 0, harvestWeeks: 10, coldHardy: false },
  "Snapdragon":   { startIndoors: -8, directSow: -2, harvestWeeks: 10, coldHardy: true },
  "Petunia":      { startIndoors: -8, directSow: 1, harvestWeeks: 10, coldHardy: false },
};

function parseFrostDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.includes("N/A")) return null;
  const currentYear = new Date().getFullYear();
  const d = new Date(`${dateStr}, ${currentYear}`);
  return isNaN(d.getTime()) ? null : d;
}

function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export type PlantTiming = {
  name: string;
  startIndoors: string | null;
  directSow: string;
  status: "now" | "soon" | "later" | "past";
  statusLabel: string;
  coldHardy: boolean;
};

export function getPlantingSchedule(lastFrostStr: string, plantNames: string[]): PlantTiming[] {
  const lastFrost = parseFrostDate(lastFrostStr);
  if (!lastFrost) return [];

  const now = new Date();
  const results: PlantTiming[] = [];

  const timingKeys = Object.keys(PLANTING_TIMING);
  const timingLookup = new Map(timingKeys.map(k => [k.toLowerCase(), k]));

  for (const name of plantNames) {
    const canonicalKey = timingLookup.get(name.toLowerCase());
    const timing = canonicalKey ? PLANTING_TIMING[canonicalKey] : undefined;
    if (!timing) continue;

    const sowDate = addWeeks(lastFrost, timing.directSow);
    const indoorsDate = timing.startIndoors ? addWeeks(lastFrost, timing.startIndoors) : null;

    const diffDays = Math.round((sowDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status: PlantTiming["status"];
    let statusLabel: string;

    if (diffDays < -14) {
      status = "past";
      statusLabel = "Window passed";
    } else if (diffDays <= 14) {
      status = "now";
      statusLabel = "Plant now!";
    } else if (diffDays <= 42) {
      status = "soon";
      statusLabel = `In ${Math.ceil(diffDays / 7)} weeks`;
    } else {
      status = "later";
      statusLabel = formatDate(sowDate);
    }

    results.push({
      name,
      startIndoors: indoorsDate ? formatDate(indoorsDate) : null,
      directSow: formatDate(sowDate),
      status,
      statusLabel,
      coldHardy: timing.coldHardy,
    });
  }

  results.sort((a, b) => {
    const order = { now: 0, soon: 1, later: 2, past: 3 };
    return order[a.status] - order[b.status];
  });

  return results;
}

export function getZoneTips(lastFrostStr: string, firstFrostStr: string, zone: string): string[] {
  const lastFrost = parseFrostDate(lastFrostStr);
  const firstFrost = parseFrostDate(firstFrostStr);

  if (!lastFrost || !firstFrost) {
    return [
      "Place taller plants on the north side of your box so they don't shade shorter ones.",
      "Pay attention to companion warnings! Some plants secrete chemicals that stunt others.",
      "Don't forget spacing. A crowded garden is prone to disease and poor yields.",
    ];
  }

  const now = new Date();
  const growingDays = Math.round((firstFrost.getTime() - lastFrost.getTime()) / (1000 * 60 * 60 * 24));
  const daysToLastFrost = Math.round((lastFrost.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysToFirstFrost = Math.round((firstFrost.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const tips: string[] = [];

  tips.push(`Your growing season is about ${growingDays} days (${formatDate(lastFrost)} to ${formatDate(firstFrost)}). Choose varieties that mature within this window.`);

  if (daysToLastFrost > 30) {
    tips.push(`Your last frost is ${formatDate(lastFrost)} — start warm-season seeds (tomato, pepper, eggplant) indoors 6-8 weeks before that date.`);
  } else if (daysToLastFrost > 0) {
    tips.push(`Last frost is just ${daysToLastFrost} days away on ${formatDate(lastFrost)}! Start hardening off seedlings and get cold-hardy crops in the ground.`);
  } else if (daysToFirstFrost > 60) {
    tips.push(`Frost season has passed. It's safe to plant warm-season crops. You have about ${daysToFirstFrost} days until first fall frost on ${formatDate(firstFrost)}.`);
  } else if (daysToFirstFrost > 0) {
    tips.push(`Fall frost arrives ${formatDate(firstFrost)} — focus on quick-maturing crops like lettuce, radish, and spinach. Protect tender plants on cold nights.`);
  }

  const zoneNum = parseInt(zone.replace(/[^0-9]/g, ""));
  if (zoneNum <= 4) {
    tips.push("In your cold zone, extend the season with row covers, cold frames, or hoop houses. Mulch heavily in fall.");
  } else if (zoneNum >= 9) {
    tips.push("In your warm zone, you can grow year-round! Consider succession planting and shade cloth for summer heat protection.");
  } else {
    tips.push("Use companion planting to your advantage — pair tomatoes with basil, and plant marigolds to deter pests naturally.");
  }

  return tips;
}
