import { getPlan } from "./catalog.js";
import * as core from "./core.js";

let plan;
try {
  plan = getPlan(new URLSearchParams(location.search).get("plan") || "sde");
} catch (error) {
  document.getElementById("feedback").hidden = false;
  document.getElementById("feedback").textContent = error.message;
  throw error;
}
const { days, weeks } = plan;
const { MAX_BACKUP_BYTES, dayOffset, dateForDay, formatDate } = core;
const STORAGE_KEY = plan.key === "sde" ? core.STORAGE_KEY : "level-up-club:business:v1";
const defaultState = () => core.defaultState(plan.key);
const validateState = value => core.validateState(value, plan.key);
const parseBackup = text => core.parseBackup(text, plan.key);
const counts = (value, week) => core.counts(value, week, plan.key);

const $ = id => document.getElementById(id);
let state = defaultState();
let storageAvailable = true;
let selectedDay;
let importing = false;
let lastOffset;

function storageStatus(message, failed = false) {
  $("storage-status").textContent = message;
  $("storage-status").classList.toggle("error", failed);
}

function feedback(message, failed = false) {
  $("feedback").textContent = message;
  $("feedback").hidden = false;
  $("feedback").classList.toggle("error", failed);
}

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) state = parseBackup(stored);
    const probe = `${STORAGE_KEY}:probe`;
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    storageStatus(stored === null ? "Device storage ready · Changes stay in this browser. No automatic syncing." : "Saved on this device · No automatic syncing.");
  } catch (error) {
    storageAvailable = false;
    storageStatus(`Not saved: ${error.message} Existing stored data has not been overwritten. You can use this session and export a backup.`, true);
  }
}

function persist() {
  if (!storageAvailable) {
    storageStatus("Not saved · Device storage is unavailable or contains unreadable data. Changes are in memory only; export a backup before leaving.", true);
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageStatus("Saved on this device · No automatic syncing.");
    return true;
  } catch (error) {
    storageStatus(`Not saved: ${error.message} Changes are in memory only. Export a backup before leaving.`, true);
    return false;
  }
}

function currentDay() {
  return Math.max(1, Math.min(28, dayOffset(state.startDate) + 1));
}

function renderOverview() {
  const offset = dayOffset(state.startDate);
  const { done, total } = counts(state);
  $("start-date").value = state.startDate;
  $("percent").textContent = `${Math.round(done / total * 100)}%`;
  $("total-progress").value = done;
  $("total-progress").max = total;
  $("total-progress").setAttribute("aria-valuetext", `${done} of ${total} practice tasks completed`);
  $("total-label").textContent = `${done} of ${total} practice tasks completed`;
  $("calendar-status").textContent = offset < 0
    ? `Starts ${formatDate(dateForDay(state.startDate, 1))}. Preview any day now.`
    : offset > 27
      ? "The 28-day calendar has ended. Unfinished days are still here—continue at your pace."
      : `Calendar: Day ${offset + 1} of 28 · Week ${Math.floor(offset / 7) + 1}. Progress is tracked separately.`;
  const next = days.find(day => day.tasks.some(task => !state.completed.includes(task.id)));
  $("next-label").textContent = next ? `Next unfinished: Day ${next.number} · ${next.title}` : "All practice tasks complete. Reopen any task for another rep.";
  $("go-current").textContent = offset < 0 ? "Preview Day 1" : offset > 27 ? "Open last scheduled day" : `Open calendar Day ${offset + 1}`;
}

function renderTasks() {
  const day = days[selectedDay - 1];
  $("day-kicker").textContent = `WEEK ${Math.ceil(selectedDay / 7)} · DAY ${selectedDay} OF 28`;
  $("day-heading").textContent = day.title;
  $("day-date").textContent = `${formatDate(dateForDay(state.startDate, selectedDay))} · ${day.tasks.filter(task => state.completed.includes(task.id)).length}/3 tasks complete`;
  $("day-select").value = String(selectedDay);
  $("previous-day").disabled = selectedDay === 1;
  $("next-day").disabled = selectedDay === 28;
  $("tasks").replaceChildren(...day.tasks.map(task => {
    const label = document.createElement("label");
    label.className = "task";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.completed.includes(task.id);
    checkbox.dataset.task = task.id;
    const content = document.createElement("span");
    const category = document.createElement("span");
    category.className = "category";
    category.textContent = task.category;
    const title = document.createElement("strong");
    title.textContent = task.title;
    const detail = document.createElement("span");
    detail.className = "detail";
    detail.textContent = task.detail;
    content.append(category, title, detail);
    label.append(checkbox, content);
    return label;
  }));
  $("notes").value = state.notes[selectedDay] || "";
}

function renderWeeks() {
  $("weeks").replaceChildren(...weeks.map((week, weekIndex) => {
    const card = document.createElement("article");
    card.className = "card";
    const kicker = document.createElement("p");
    kicker.className = "eyebrow";
    kicker.textContent = `WEEK ${weekIndex + 1}`;
    const header = document.createElement("div");
    header.className = "week-header";
    const title = document.createElement("h3");
    title.textContent = week.title;
    const count = counts(state, weekIndex);
    const label = document.createElement("span");
    label.textContent = `${count.done}/${count.total} tasks`;
    header.append(title, label);
    const description = document.createElement("p");
    description.className = "fine";
    description.textContent = week.subtitle;
    const progress = document.createElement("progress");
    progress.max = count.total;
    progress.value = count.done;
    progress.setAttribute("aria-label", `Week ${weekIndex + 1}: ${count.done} of ${count.total} tasks complete`);
    card.append(kicker, header, description, progress);
    for (const day of days.slice(weekIndex * 7, weekIndex * 7 + 7)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "day-link";
      button.dataset.day = day.number;
      const text = document.createElement("span");
      text.className = "day-text";
      const heading = document.createElement("strong");
      heading.textContent = `Day ${day.number} · ${day.title}`;
      const date = document.createElement("small");
      date.textContent = formatDate(dateForDay(state.startDate, day.number));
      text.append(heading, date);
      const completed = document.createElement("span");
      completed.className = "day-count";
      completed.textContent = `${day.tasks.filter(task => state.completed.includes(task.id)).length}/3 →`;
      button.append(text, completed);
      card.append(button);
    }
    return card;
  }));
}

function showView(name) {
  for (const view of ["daily", "weeks", "guide"]) {
    const active = view === name;
    $(`${view}-view`).hidden = !active;
    $(`${view}-tab`).classList.toggle("active", active);
    $(`${view}-tab`).setAttribute("aria-pressed", String(active));
  }
}

function openDay(number, focus = false) {
  selectedDay = number;
  renderTasks();
  showView("daily");
  if (focus) $("day-heading").focus();
}

function render() {
  renderOverview();
  renderTasks();
  renderWeeks();
}

function configureTrack() {
  $(`${plan.key === "sde" ? "sde" : "business"}-track`).setAttribute("aria-current", "page");
  if (plan.key !== "business") return;
  document.title = "Level Up Club · Program & Business Track";
  document.querySelector(".brand").href = "?plan=business";
  $("track-description").textContent = "A non-coding practice plan for senior program management, business operations, and sales strategy interviews. Structure the problem. Lead with evidence.";
  $("routine-split").textContent = "45m business practice · 45m analytics · 30m leadership";
  const cards = [
    ["Prepare for the actual role", "Primary focus: Amazon L6 Senior Program Manager / Program Manager III, Business Operations, and Sales Operations or Sales Strategy roles. Also useful for PMO, commercial strategy, business transformation, operations strategy, and automotive or industrial consulting.", "This is not a software engineering track: no algorithm drills, Python, or system design. Use Excel, Power BI, relevant VBA, and basic business SQL. Follow the actual job description and recruiter guidance."],
    ["Structure, calculate, recommend", "For cases: clarify the objective, build a hypothesis tree, prioritize analysis, calculate with units, and synthesize a recommendation. Practice profitability, market entry, pricing, GTM, channel/territory strategy, unit economics, and operations.", "Use synthetic datasets. Check formulas, joins, KPI denominators, forecast error, and sensitivity. Label all hypothetical assumptions; do not dress practice numbers up as real achievements."],
    ["Lead with truthful evidence", "Build a private STAR story bank with 1–2 story angles per priority principle: Ownership, Dive Deep, Deliver Results, Invent and Simplify, Earn Trust, Think Big, Bias for Action, and Have Backbone; Disagree and Commit.", "Examples can cover more than one principle when relevant. Separate personal actions from team effort. Include genuine mistakes, disagreement, learning, and measured or honestly qualitative results—never fabricated stories."],
    ["Mechanisms over buzzwords", "Practice scoping, milestones, dependencies, risks, influencing without authority, WBR/MBR operating reviews, status updates, KPI trees, and concise decision-oriented writing. Outline six-page narratives and PR/FAQ documents as practice.", "Review structure, quantitative accuracy, judgment, mechanisms, influence, ownership, and evidence. These are practice heuristics, not hiring cutoffs. The suggested four-week plan is adjustable; no interview date or fixed loop is assumed. Confirm any written or analytical assessment with the recruiter."],
  ];
  $("guide-cards").replaceChildren(...cards.map(([heading, ...paragraphs]) => {
    const article = document.createElement("article");
    article.className = "card";
    const title = document.createElement("h3");
    title.textContent = heading;
    article.append(title);
    for (const paragraph of paragraphs) {
      const p = document.createElement("p");
      p.textContent = paragraph;
      article.append(p);
    }
    return article;
  }));
  $("role-resource").href = "https://www.amazon.jobs/content/en/how-we-hire";
  $("role-resource").textContent = "Amazon: How we hire ↗ (opens in a new tab)";
}

configureTrack();
load();
selectedDay = currentDay();
lastOffset = dayOffset(state.startDate);
for (const day of days) {
  const option = document.createElement("option");
  option.value = day.number;
  option.textContent = `Day ${day.number}`;
  $("day-select").append(option);
}
render();

for (const view of ["daily", "weeks", "guide"]) $(`${view}-tab`).addEventListener("click", () => showView(view));
$("go-current").addEventListener("click", () => openDay(currentDay(), true));
$("day-select").addEventListener("change", event => openDay(Number(event.target.value)));
$("previous-day").addEventListener("click", () => openDay(selectedDay - 1));
$("next-day").addEventListener("click", () => openDay(selectedDay + 1));
$("weeks").addEventListener("click", event => {
  const button = event.target.closest("button[data-day]");
  if (button) openDay(Number(button.dataset.day), true);
});
$("tasks").addEventListener("change", event => {
  const id = event.target.dataset.task;
  if (!id) return;
  state.completed = event.target.checked ? [...new Set([...state.completed, id])] : state.completed.filter(item => item !== id);
  persist();
  // Keep the focused checkbox in place for keyboard and screen-reader users.
  renderOverview();
  renderWeeks();
  $("day-date").textContent = `${formatDate(dateForDay(state.startDate, selectedDay))} · ${days[selectedDay - 1].tasks.filter(task => state.completed.includes(task.id)).length}/3 tasks complete`;
});
$("notes").addEventListener("input", event => {
  state.notes[selectedDay] = event.target.value;
  persist();
});
$("start-date").addEventListener("change", event => {
  try {
    const next = validateState({ ...state, startDate: event.target.value });
    state = next;
    persist();
    lastOffset = dayOffset(state.startDate);
    render();
    feedback("Start date updated. Checked tasks and notes were kept.");
  } catch (error) {
    event.target.value = state.startDate;
    feedback(error.message, true);
  }
});
$("export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `level-up-club-${plan.key}-private-backup.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  feedback("Backup download requested. It includes your notes—keep it private and check that the file downloaded.");
});
$("import").addEventListener("click", () => $("import-file").click());
$("import-file").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file || importing) return;
  importing = true;
  $("import").disabled = true;
  try {
    if (file.size > MAX_BACKUP_BYTES) throw new Error("Backup is too large. Maximum size is 512 KB.");
    const next = parseBackup(await file.text());
    if (!window.confirm("Replace this device's start date, checked tasks, and notes with this backup? Export your current progress first if you want to keep it.")) {
      feedback("Import cancelled. Your existing progress is unchanged.");
      return;
    }
    state = next;
    const saved = persist();
    selectedDay = currentDay();
    lastOffset = dayOffset(state.startDate);
    render();
    feedback(saved ? "Backup imported and saved on this device." : "Backup imported into memory only. Device storage is unavailable; export before leaving.", !saved);
  } catch (error) {
    feedback(`Import rejected: ${error.message} Your existing progress is unchanged.`, true);
  } finally {
    event.target.value = "";
    importing = false;
    $("import").disabled = false;
  }
});

window.addEventListener("storage", event => {
  if (event.key === STORAGE_KEY || event.key === null) {
    // Do not silently overwrite edits in another open tab.
    storageAvailable = false;
    storageStatus("Not saved · Device data changed in another tab. Export these edits, then reload to use the other tab's data.", true);
  }
});
function refreshCalendar() {
  const offset = dayOffset(state.startDate);
  if (offset !== lastOffset) {
    lastOffset = offset;
    renderOverview();
  }
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshCalendar(); });
setInterval(refreshCalendar, 60000);
