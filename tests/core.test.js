import test from "node:test";
import assert from "node:assert/strict";
import { days } from "../plan.js";
import { getPlan } from "../catalog.js";
import { defaultState, dayStamp, dayOffset, dateForDay, localDate, counts, parseBackup, validateState, MAX_BACKUP_BYTES } from "../core.js";

test("28 useful days have three uniquely identifiable tasks and a meaningful denominator", () => {
  assert.equal(days.length, 28);
  assert.ok(days.every(day => day.tasks.length === 3 && day.tasks.every(task => task.detail.length > 60)));
  assert.equal(new Set(days.flatMap(day => day.tasks.map(task => task.id))).size, 84);
  const state = defaultState();
  state.completed = ["d1-t1", "d8-t2"];
  assert.deepEqual(counts(state), { done: 2, total: 84 });
  assert.deepEqual(counts(state, 0), { done: 1, total: 21 });
  assert.deepEqual(counts(state, 1), { done: 1, total: 21 });
});

test("calendar dates are exact across month/year, leap day, and DST boundaries", () => {
  assert.equal(dayOffset("2026-11-05", "2026-11-04"), -1);
  assert.equal(dayOffset("2026-11-05", "2026-11-05"), 0);
  assert.equal(dayOffset("2026-11-05", "2026-12-02"), 27);
  assert.equal(dayOffset("2026-11-05", "2026-12-03"), 28);
  assert.equal(dayOffset("2026-03-07", "2026-03-10"), 3);
  assert.equal(dayOffset("2026-10-31", "2026-11-02"), 2);
  assert.equal(dayOffset("2028-02-28", "2028-03-01"), 2);
  assert.equal(dateForDay("2026-12-20", 28).toISOString().slice(0, 10), "2027-01-16");
  assert.equal(localDate(new Date(2026, 10, 5, 0, 1)), "2026-11-05");
  for (const bad of ["2026-02-29", "2026-13-01", "2026-11-31", "11/05/2026", "", "0001-01-01"]) assert.throws(() => dayStamp(bad));
});

test("a valid backup roundtrips without interpreting plain-text notes", () => {
  const state = { ...defaultState(), completed: ["d1-t1", "d28-t3"], notes: { 1: '<img src=x onerror="alert(1)">', 28: "Rest.\nThen reflect." } };
  assert.deepEqual(parseBackup(JSON.stringify(state)), state);
  for (const note of ["界".repeat(2000), "\u0000".repeat(2000)]) {
    const fullState = { ...state, notes: Object.fromEntries(days.map(day => [day.number, note])) };
    assert.deepEqual(parseBackup(JSON.stringify(fullState, null, 2)), fullState);
  }
});

test("reject malformed, oversized, and schema-invalid backups without mutating existing data", () => {
  const state = defaultState();
  const original = JSON.stringify(state);
  const invalid = [
    "{", "null", "[]", JSON.stringify({ ...state, version: 2 }),
    JSON.stringify({ ...state, startDate: "2026-02-30" }),
    JSON.stringify({ ...state, completed: ["d99-t1"] }),
    JSON.stringify({ ...state, completed: ["d1-t1", "d1-t1"] }),
    JSON.stringify({ ...state, completed: [1] }),
    JSON.stringify({ ...state, notes: { 29: "No" } }),
    JSON.stringify({ ...state, notes: { 1: 42 } }),
    JSON.stringify({ ...state, notes: { 1: "x".repeat(2001) } }),
    JSON.stringify({ ...state, notes: [] }),
    JSON.stringify({ ...state, extra: true }),
    '{"version":1,"startDate":"2026-11-05","completed":[],"notes":{"__proto__":"bad"}}',
    " ".repeat(MAX_BACKUP_BYTES + 1),
    JSON.stringify({ ...state, notes: { 1: "界".repeat(10000), 2: "界".repeat(10000) } }).padEnd(MAX_BACKUP_BYTES, " "),
  ];
  for (const text of invalid) assert.throws(() => parseBackup(text));
  assert.equal(JSON.stringify(state), original);
  assert.notEqual(validateState(state), state);
});

test("business track has 28 complete role-specific days and isolated backups", () => {
  const business = getPlan("business");
  assert.equal(business.days.length, 28);
  assert.equal(business.weeks.length, 4);
  assert.ok(business.days.every(day => day.tasks.length === 3 && day.tasks.every(task => task.detail.length > 60 && task.category !== "Coding" && task.category !== "Design")));
  const ids = business.days.flatMap(day => day.tasks.map(task => task.id));
  assert.equal(new Set(ids).size, 84);
  assert.ok(ids.every(id => id.startsWith("b")));
  const state = { ...defaultState("business"), completed: ["b1-t1", "b8-t1"], notes: { 1: "A private reminder" } };
  assert.deepEqual(counts(state, undefined, "business"), { done: 2, total: 84 });
  assert.deepEqual(counts(state, 1, "business"), { done: 1, total: 21 });
  assert.deepEqual(parseBackup(JSON.stringify(state), "business"), state);
  assert.throws(() => parseBackup(JSON.stringify(state)));
  assert.throws(() => parseBackup(JSON.stringify(defaultState()), "business"));
  assert.throws(() => parseBackup(JSON.stringify({ ...state, completed: ["d1-t1"] }), "business"));
  assert.throws(() => getPlan("not-a-track"));
});
