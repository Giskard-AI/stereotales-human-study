import attributionsData from "@/data/attributions.json";

const attributions = attributionsData as Record<string, string[]>;

export function getAttributionCount(): number {
  return Object.keys(attributions).length;
}

export function getAttribution(index: number): string[] {
  const entry = attributions[String(index)];
  if (!entry) {
    throw new Error(`Attribution index ${index} not found`);
  }
  return entry;
}
