export const dailyLines = [
  { line: "Some words are meant to be written slowly.", sub: "Good evening." },
  { line: "Begin with one honest line.", sub: "Good morning." },
  { line: "Let the quiet do some of the writing.", sub: "Tonight." },
  { line: "Small poems hold large feelings.", sub: "Today." },
];

export function dailyMoment(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return dailyLines[day % dailyLines.length];
}

export const atmospheres = [
  { id: "midnight", label: "Midnight" },
  { id: "paper", label: "Paper" },
  { id: "lavender", label: "Lavender" },
  { id: "rain", label: "Rain" },
  { id: "dawn", label: "Dawn" },
] as const;

export type AtmosphereId = (typeof atmospheres)[number]["id"];
