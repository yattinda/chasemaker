export const DURATION_OPTIONS = [1, 1.5, 2, 2.5, 3] as const;

const COUNTDOWN_MINUTE_STEPS = [1, 3, 5, 10, 15, 20, 30];
const STANDARD_INTERVAL_MINUTES = 30;
/** 1次会モード: 1〜3杯目の間隔（4杯目以降は STANDARD_INTERVAL_MINUTES） */
const FIRST_SESSION_INTERVALS = [20, 20, 20] as const;

export function maxDrinksForDuration(durationHours: number) {
  return Math.floor(durationHours * 2.5);
}

export function intervalMinutesAfterDrink(afterDrinksCount: number, isFirstSession: boolean) {
  if (!isFirstSession) return STANDARD_INTERVAL_MINUTES;
  return FIRST_SESSION_INTERVALS[afterDrinksCount - 1] ?? STANDARD_INTERVAL_MINUTES;
}

export function canFitInterval(
  intervalMinutes: number,
  sessionStart: number | null,
  durationHours: number,
  now = Date.now(),
) {
  const start = sessionStart ?? now;
  const sessionEnd = start + durationHours * 60 * 60 * 1000;
  return now + intervalMinutes * 60 * 1000 <= sessionEnd;
}

export function remainingSeconds(endTimestamp: number, now: number) {
  return Math.max(0, Math.ceil((endTimestamp - now) / 1000));
}

export function headerMessage(
  countdownSec: number | null,
  drinks: number,
  maxDrinks: number,
  canOrderNext: boolean,
) {
  if (drinks >= maxDrinks || !canOrderNext) return 'お酒は控えめに...';
  if (drinks === 0) return 'ビールを飲みましょう';
  if (countdownSec === null) return 'まだ飲めますね';

  const totalMinutes = Math.ceil(countdownSec / 60);
  const rounded = COUNTDOWN_MINUTE_STEPS.find((step) => totalMinutes <= step) ?? 30;
  return `あと${rounded}分くらい`;
}
