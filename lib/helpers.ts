export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function startOfLocalDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function msUntilNextLocalMidnight(from = new Date()) {
  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
  return next.getTime() - from.getTime();
}

export function msUntilNextGreetingChange(from = new Date()) {
  const next = new Date(from);
  const hour = from.getHours();
  if (hour < 12) {
    next.setHours(12, 0, 0, 0);
  } else if (hour < 17) {
    next.setHours(17, 0, 0, 0);
  } else {
    return msUntilNextLocalMidnight(from);
  }
  return next.getTime() - from.getTime();
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatLongDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysRemaining(capturedAt: string, quarantineDays = 14, now = new Date()) {
  const captured = startOfLocalDay(new Date(capturedAt));
  const due = new Date(
    captured.getFullYear(),
    captured.getMonth(),
    captured.getDate() + quarantineDays,
  );
  const today = startOfLocalDay(now);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

