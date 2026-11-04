import { getPlan } from "./catalog.js";

export const VERSION = 1;
export const STORAGE_KEY = "level-up-club:v1";
export const MAX_BACKUP_BYTES = 512 * 1024;
export const taskIds = new Set(getPlan().days.flatMap(day => day.tasks.map(task => task.id)));
export const defaultState = (plan = "sde") => {
  getPlan(plan);
  return { version: VERSION, ...(plan === "business" ? { plan } : {}), startDate: "2026-11-05", completed: [], notes: {} };
};

// Calendar-day arithmetic uses UTC midnight, but "today" comes from local date parts.
export function dayStamp(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Use a valid calendar date.");
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1900 || year > 2100) throw new Error("Choose a start date between 1900 and 2100.");
  const stamp = Date.UTC(year, month - 1, day);
  if (new Date(stamp).toISOString().slice(0, 10) !== value) throw new Error("Use a valid calendar date.");
  return stamp;
}

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dayOffset(startDate, today = localDate()) {
  return (dayStamp(today) - dayStamp(startDate)) / 86400000;
}

export function dateForDay(startDate, number) {
  return new Date(dayStamp(startDate) + (number - 1) * 86400000);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateState(value, plan = "sde") {
  const { days } = getPlan(plan);
  const ids = new Set(days.flatMap(day => day.tasks.map(task => task.id)));
  const fields = plan === "business" ? "completed,notes,plan,startDate,version" : "completed,notes,startDate,version";
  if (!isRecord(value) || Object.keys(value).sort().join(",") !== fields ||
      (plan === "business" && value.plan !== plan)) throw new Error("Backup does not match this study track's schema. Import it in the track where it was exported.");
  if (value.version !== VERSION) throw new Error("Unsupported backup version. Expected version 1.");
  dayStamp(value.startDate);
  if (!Array.isArray(value.completed) || value.completed.length > ids.size ||
      value.completed.some(id => typeof id !== "string" || !ids.has(id)) ||
      new Set(value.completed).size !== value.completed.length) throw new Error("Backup contains invalid or repeated task IDs.");
  if (!isRecord(value.notes) || Object.keys(value.notes).length > 28 ||
      Object.entries(value.notes).some(([key, note]) => !/^(?:[1-9]|1\d|2[0-8])$/.test(key) || typeof note !== "string" || note.length > 2000)) throw new Error("Backup notes must be plain text, at most 2,000 characters for each of the 28 days.");
  return { version: VERSION, ...(plan === "business" ? { plan } : {}), startDate: value.startDate, completed: [...value.completed], notes: { ...value.notes } };
}

export function parseBackup(text, plan = "sde") {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) throw new Error("Backup is too large. Maximum size is 512 KB.");
  let value;
  try { value = JSON.parse(text); } catch { throw new Error("This is not valid JSON. Choose a Level Up Club backup."); }
  return validateState(value, plan);
}

export function counts(state, weekIndex, plan = "sde") {
  const { days } = getPlan(plan);
  const selected = weekIndex === undefined ? days : days.slice(weekIndex * 7, weekIndex * 7 + 7);
  const ids = new Set(selected.flatMap(day => day.tasks.map(task => task.id)));
  return { done: state.completed.filter(id => ids.has(id)).length, total: ids.size };
}
