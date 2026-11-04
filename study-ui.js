import { dailyResources, resourceById, resourcesForTrack } from "./study-content.js?v=3";
import { httpsUrl, validateNews, newsForTrack } from "./market.js?v=3";

const $ = id => document.getElementById(id);
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function externalLink(title, url, className = "") {
  const safe = httpsUrl(url);
  if (!safe) throw new Error("A study resource has an invalid HTTPS URL.");
  const link = element("a", className, title);
  link.href = safe;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.append(element("span", "sr-only", " (opens an external site in a new tab)"));
  return link;
}

function lessonContent(resource) {
  const details = element("details", "lesson-content");
  details.append(element("summary", "", "Study here · lesson & exercise"));
  for (const [heading, text, format] of resource.sections) {
    details.append(element("h4", "", heading));
    if (format === "code") {
      const pre = element("pre");
      pre.append(element("code", "", text));
      details.append(pre);
    } else {
      details.append(element("p", "", text));
    }
  }
  if (resource.answer) {
    const answer = element("details", "worked-check");
    answer.append(element("summary", "", "Show worked check · try it first"), element("p", "", resource.answer));
    details.append(answer);
  }
  return details;
}

export function createStudyHub(track, showView) {
  const catalog = resourcesForTrack(track);
  let newsLoaded = false;
  let loading = false;
  $("market-lens").textContent = track === "business"
    ? "Read one business or operations story: name the customer impact, KPI affected, likely cause, uncertainty, and a decision you would test. This is business context, not investment advice or a prediction of interview questions."
    : "Read one engineering story: identify the customer constraint, architecture change, reliability/security tradeoff, and evidence you would ask for. Announcements are not proof of performance or predictions of interview questions.";

  const kinds = [...new Set(catalog.map(resource => resource.kind))].sort();
  for (const kind of kinds) {
    const option = element("option", "", kind);
    option.value = kind;
    $("resource-kind").append(option);
  }

  function renderLibrary() {
    const query = $("resource-search").value.trim().toLowerCase();
    const kind = $("resource-kind").value;
    const matches = catalog.filter(resource => (!kind || resource.kind === kind) &&
      [resource.title, resource.topic, resource.summary, resource.source].join(" ").toLowerCase().includes(query));
    $("resource-count").textContent = `${matches.length} of ${catalog.length} resources in this track`;
    $("resource-empty").hidden = matches.length > 0;
    $("resource-list").replaceChildren(...matches.map(resource => {
      const card = element("article", "card resource-card");
      card.dataset.resourceId = resource.id;
      card.append(element("p", "eyebrow", `${resource.kind} · ${resource.topic}`));
      const heading = element("h3", "", resource.title);
      heading.tabIndex = -1;
      card.append(heading, element("p", "resource-description", resource.summary), element("p", "fine", `${resource.source} · ${resource.access}`));
      if (resource.url) card.append(externalLink("Open resource ↗", resource.url, "resource-open"));
      else card.append(lessonContent(resource));
      return card;
    }));
  }

  function openResource(id) {
    const resource = resourceById.get(id);
    if (!resource || !resource.tracks.includes(track)) throw new Error("The resource is not available in this track.");
    $("resource-search").value = resource.title;
    $("resource-kind").value = "";
    renderLibrary();
    showView("library");
    const card = [...$("resource-list").children].find(node => node.dataset.resourceId === id);
    const details = card.querySelector("details");
    if (details) details.open = true;
    card.querySelector("h3").focus();
  }

  function taskMaterials(dayNumber, taskIndex) {
    const ids = dailyResources(track, dayNumber)[taskIndex];
    const materials = element("div", "task-materials");
    materials.append(element("p", "material-label", "STUDY DESK · PICK A STARTING POINT"));
    const list = element("ul", "daily-resources");
    for (const id of ids) {
      const resource = resourceById.get(id);
      const item = element("li");
      item.append(element("span", "resource-kind", resource.kind));
      if (resource.url) {
        item.append(externalLink(`${resource.title} ↗`, resource.url));
      } else {
        const button = element("button", "lesson-link", `${resource.title} · study here`);
        button.type = "button";
        button.dataset.resource = id;
        item.append(button);
      }
      item.append(element("small", "", resource.access));
      list.append(item);
    }
    materials.append(list);
    if (track === "sde" && taskIndex === 0) {
      materials.append(element("p", "fine", dayNumber === 28
        ? "Warmup is optional. Rest counts when that is the intentional choice."
        : "Already solved the suggested problem? Choose a fresh one from the library's CSES set. Attempt before watching; linked alternatives are not all mandatory."));
    }
    return materials;
  }

  function renderNews(snapshot) {
    const { sources, items, stale } = newsForTrack(snapshot, track);
    const failed = sources.filter(source => source.status === "error");
    const format = value => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
    const updated = `Snapshot generated ${format(snapshot.generatedAt)}.`;
    $("news-status").textContent = stale
      ? `This snapshot is stale or its timestamp is inconsistent. ${updated} Open the source sites for the latest reporting.`
      : `${updated} ${failed.length ? `${failed.length} source(s) unavailable; retained headlines are labeled below.` : "Sources checked at deployment."}`;
    $("news-status").classList.toggle("error", stale || failed.length > 0);
    const byId = new Map(sources.map(source => [source.id, source]));
    $("news-list").replaceChildren(...items.map(item => {
      const source = byId.get(item.sourceId);
      const old = stale || source.status === "error" || !source.lastSuccessAt || Date.now() - Date.parse(source.lastSuccessAt) > 36 * 3600000;
      const card = element("article", "card news-card");
      card.append(element("p", "eyebrow", `${source.name} · ${old ? "EARLIER SNAPSHOT" : "RECENT HEADLINE"}`));
      const heading = element("h3");
      heading.append(externalLink(item.title, item.url));
      const time = element("time", "", format(item.publishedAt));
      time.dateTime = item.publishedAt;
      const meta = element("p", "fine");
      meta.append(time, document.createTextNode(` · ${source.type} · access/paywalls vary`));
      card.append(heading, meta, element("p", "news-lens", source.lens));
      return card;
    }));
    $("news-empty").hidden = items.length > 0;
    $("news-sources").replaceChildren(...sources.map(source => {
      const item = element("li");
      item.append(externalLink(source.name, source.site));
      const status = source.status === "error" ? "Feed unavailable; open source directly."
        : source.status === "empty" ? "No matching headlines from the last 30 days." : "Feed checked.";
      item.append(element("span", "fine", `${source.type}. ${status}${source.lastSuccessAt ? ` Last success: ${format(source.lastSuccessAt)}.` : ""}`));
      return item;
    }));
  }

  async function loadNews(force = false) {
    if (loading || (newsLoaded && !force)) return;
    loading = true;
    $("news-refresh").disabled = true;
    $("news-status").textContent = "Checking the latest published news snapshot…";
    $("news-status").classList.remove("error");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("./news.json", { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`News snapshot returned HTTP ${response.status}.`);
      const text = await response.text();
      if (new TextEncoder().encode(text).length > 256 * 1024) throw new Error("The news snapshot is too large.");
      const snapshot = validateNews(JSON.parse(text));
      renderNews(snapshot);
      newsLoaded = true;
    } catch (error) {
      $("news-status").textContent = `News unavailable: ${error.message} Check your connection and try again. Previously displayed articles, if any, are an earlier snapshot—not live news.`;
      $("news-status").classList.add("error");
      for (const kicker of $("news-list").querySelectorAll(".eyebrow")) kicker.textContent = "EARLIER SNAPSHOT · refresh unavailable";
    } finally {
      clearTimeout(timeout);
      loading = false;
      $("news-refresh").disabled = false;
    }
  }

  $("resource-search").addEventListener("input", renderLibrary);
  $("resource-kind").addEventListener("change", renderLibrary);
  $("resource-clear").addEventListener("click", () => {
    $("resource-search").value = "";
    $("resource-kind").value = "";
    renderLibrary();
    $("resource-search").focus();
  });
  document.addEventListener("click", event => {
    const button = event.target.closest("button[data-resource]");
    if (button) openResource(button.dataset.resource);
  });
  $("news-refresh").addEventListener("click", () => loadNews(true));
  renderLibrary();
  return { taskMaterials, loadNews };
}
