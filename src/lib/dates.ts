import { RULES } from "./config";

/** Parts of a moment as seen on a wall clock in IST. */
function istParts(now: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: RULES.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const p = Object.fromEntries(fmt.formatToParts(now).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
}

/** Adds days to a YYYY-MM-DD string without timezone drift. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekday(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay();
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function todayIST(now = new Date()): string {
  return istParts(now).date;
}

/**
 * Bake days a customer can still order for. A day is open until
 * RULES.cutoffHour IST on the day before, and closed weekdays are skipped.
 */
export function orderableDates(now = new Date()): string[] {
  const { date: today, hour } = istParts(now);
  const firstOffset = hour < RULES.cutoffHour ? 1 : 2;
  const dates: string[] = [];
  for (let i = firstOffset; i <= RULES.daysAhead; i++) {
    const d = addDays(today, i);
    if (!RULES.closedWeekdays.includes(weekday(d))) dates.push(d);
  }
  return dates;
}

export function isOrderable(isoDate: string, now = new Date()): boolean {
  return orderableDates(now).includes(isoDate);
}

export function formatDate(isoDate: string, style: "long" | "short" = "long"): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
  }).format(d);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
