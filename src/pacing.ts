export const DURATION_OPTIONS = [1, 1.5, 2, 2.5, 3] as const;

const COUNTDOWN_MINUTE_STEPS = [1, 5, 10, 15, 20, 30];

export function maxDrinksForDuration(durationHours: number) {
  return Math.floor(durationHours * 2.5);
}

export function intervalMinutesAfterDrink(afterDrinksCount: number, isFirstSession: boolean) {
  if (!isFirstSession) return 30;
  if (afterDrinksCount === 1) return 10;
  if (afterDrinksCount === 2 || afterDrinksCount === 3) return 20;
  return 30;
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
