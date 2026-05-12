export type SliderOrder = "harmful_first" | "realism_first";

function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function getSliderOrderForParticipant(
  participantId: string,
): SliderOrder {
  return hashString(participantId) % 2 === 0
    ? "harmful_first"
    : "realism_first";
}
