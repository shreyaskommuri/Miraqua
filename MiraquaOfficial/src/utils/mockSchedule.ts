// Deterministic mock schedule — same date always yields same watering decision
// across PlotDetailsScreen and CalendarScreen.

function hashDate(dateStr: string): number {
  let h = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff; // 0..1
}

const TIMES = ['5:30 AM', '6:00 AM', '6:15 AM', '5:45 AM'];
const EXPLANATIONS = [
  'ET₀ deficit accumulated. Optimal watering window before peak heat.',
  'Soil moisture below threshold. Morning irrigation scheduled.',
  'Low rainfall forecast. Scheduled based on crop water demand.',
  'Weekly water budget requires irrigation today.',
];

export interface MockScheduleEntry {
  liters: number;
  optimal_time: string;
  explanation: string;
}

/** Returns a watering entry for the date, or null if it's a skip day. */
export function getMockScheduleEntry(dateStr: string): MockScheduleEntry | null {
  const r = hashDate(dateStr);
  if (r > 0.55) return null; // ~45% watering days
  const liters = Math.floor(r * 14) + 8; // 8–21 L
  const timeIdx = Math.floor(hashDate(dateStr + 't') * TIMES.length);
  const expIdx = Math.floor(hashDate(dateStr + 'e') * EXPLANATIONS.length);
  return {
    liters,
    optimal_time: TIMES[timeIdx],
    explanation: EXPLANATIONS[expIdx],
  };
}
