export interface ZoneInfo {
  zone: string;
  lastFrost: string;
  firstFrost: string;
}

const stateZoneMap: Record<string, ZoneInfo> = {
  AL: { zone: "Zone 7b", lastFrost: "March 25", firstFrost: "November 5" },
  AK: { zone: "Zone 2a", lastFrost: "May 20", firstFrost: "September 1" },
  AZ: { zone: "Zone 9a", lastFrost: "February 15", firstFrost: "December 1" },
  AR: { zone: "Zone 7b", lastFrost: "March 28", firstFrost: "November 3" },
  CA: { zone: "Zone 9b", lastFrost: "February 10", firstFrost: "December 15" },
  CO: { zone: "Zone 5b", lastFrost: "May 5", firstFrost: "October 1" },
  CT: { zone: "Zone 6a", lastFrost: "April 25", firstFrost: "October 10" },
  DE: { zone: "Zone 7a", lastFrost: "April 10", firstFrost: "October 28" },
  FL: { zone: "Zone 9b", lastFrost: "February 10", firstFrost: "December 15" },
  GA: { zone: "Zone 8a", lastFrost: "March 15", firstFrost: "November 15" },
  HI: { zone: "Zone 11a", lastFrost: "N/A (frost-free)", firstFrost: "N/A (frost-free)" },
  ID: { zone: "Zone 5b", lastFrost: "May 10", firstFrost: "September 25" },
  IL: { zone: "Zone 5b", lastFrost: "April 25", firstFrost: "October 10" },
  IN: { zone: "Zone 5b", lastFrost: "April 26", firstFrost: "October 10" },
  IA: { zone: "Zone 5a", lastFrost: "April 28", firstFrost: "October 5" },
  KS: { zone: "Zone 6a", lastFrost: "April 15", firstFrost: "October 15" },
  KY: { zone: "Zone 6b", lastFrost: "April 17", firstFrost: "October 18" },
  LA: { zone: "Zone 8b", lastFrost: "March 1", firstFrost: "November 20" },
  ME: { zone: "Zone 4b", lastFrost: "May 10", firstFrost: "September 25" },
  MD: { zone: "Zone 7a", lastFrost: "April 10", firstFrost: "October 25" },
  MA: { zone: "Zone 6a", lastFrost: "April 25", firstFrost: "October 10" },
  MI: { zone: "Zone 5b", lastFrost: "May 5", firstFrost: "October 5" },
  MN: { zone: "Zone 4a", lastFrost: "May 5", firstFrost: "September 28" },
  MS: { zone: "Zone 8a", lastFrost: "March 15", firstFrost: "November 10" },
  MO: { zone: "Zone 6a", lastFrost: "April 15", firstFrost: "October 15" },
  MT: { zone: "Zone 4b", lastFrost: "May 15", firstFrost: "September 15" },
  NE: { zone: "Zone 5a", lastFrost: "April 28", firstFrost: "October 5" },
  NV: { zone: "Zone 7a", lastFrost: "April 5", firstFrost: "October 20" },
  NH: { zone: "Zone 5a", lastFrost: "May 10", firstFrost: "September 25" },
  NJ: { zone: "Zone 6b", lastFrost: "April 15", firstFrost: "October 20" },
  NM: { zone: "Zone 7a", lastFrost: "April 10", firstFrost: "October 25" },
  NY: { zone: "Zone 5b", lastFrost: "May 1", firstFrost: "October 10" },
  NC: { zone: "Zone 7b", lastFrost: "April 1", firstFrost: "October 30" },
  ND: { zone: "Zone 4a", lastFrost: "May 10", firstFrost: "September 20" },
  OH: { zone: "Zone 6a", lastFrost: "April 25", firstFrost: "October 10" },
  OK: { zone: "Zone 7a", lastFrost: "March 30", firstFrost: "November 1" },
  OR: { zone: "Zone 8b", lastFrost: "March 15", firstFrost: "November 10" },
  PA: { zone: "Zone 6a", lastFrost: "April 25", firstFrost: "October 10" },
  RI: { zone: "Zone 6a", lastFrost: "April 25", firstFrost: "October 10" },
  SC: { zone: "Zone 8a", lastFrost: "March 15", firstFrost: "November 10" },
  SD: { zone: "Zone 4b", lastFrost: "May 10", firstFrost: "September 25" },
  TN: { zone: "Zone 7a", lastFrost: "April 5", firstFrost: "October 25" },
  TX: { zone: "Zone 8b", lastFrost: "February 28", firstFrost: "November 25" },
  UT: { zone: "Zone 5b", lastFrost: "May 5", firstFrost: "October 1" },
  VT: { zone: "Zone 4b", lastFrost: "May 10", firstFrost: "September 25" },
  VA: { zone: "Zone 7a", lastFrost: "April 10", firstFrost: "October 25" },
  WA: { zone: "Zone 8a", lastFrost: "March 15", firstFrost: "November 10" },
  WV: { zone: "Zone 6a", lastFrost: "April 25", firstFrost: "October 10" },
  WI: { zone: "Zone 4b", lastFrost: "May 5", firstFrost: "September 28" },
  WY: { zone: "Zone 4b", lastFrost: "May 15", firstFrost: "September 15" },
  DC: { zone: "Zone 7a", lastFrost: "April 10", firstFrost: "October 25" },
};

export interface LocationResult {
  zone: string;
  lastFrost: string;
  firstFrost: string;
  notes: string;
}

export function lookupZoneByState(state: string, city?: string): LocationResult | null {
  const key = state.trim().toUpperCase();
  const info = stateZoneMap[key];
  if (!info) return null;

  const cityLabel = city ? `${city}, ` : "";
  return {
    ...info,
    notes: `Based on your location in ${cityLabel}${key}, you are in ${info.zone}.`,
  };
}
