export function httpsUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function validateNews(value) {
  if (!value || value.version !== 1 || !Number.isFinite(Date.parse(value.generatedAt)) ||
      !Array.isArray(value.sources) || value.sources.length > 12 || !Array.isArray(value.items) || value.items.length > 100) {
    throw new Error("The news snapshot has an unsupported format.");
  }
  const ids = new Set();
  for (const source of value.sources) {
    if (!source || typeof source.id !== "string" || ids.has(source.id) || !httpsUrl(source.site) ||
        !["ok", "empty", "error"].includes(source.status) || !Array.isArray(source.tracks) ||
        !source.tracks.every(track => ["sde", "business"].includes(track)) ||
        ["name", "type", "lens"].some(key => typeof source[key] !== "string") ||
        (source.lastSuccessAt !== null && !Number.isFinite(Date.parse(source.lastSuccessAt)))) {
      throw new Error("The news source metadata is invalid.");
    }
    ids.add(source.id);
  }
  for (const item of value.items) {
    if (!item || typeof item.title !== "string" || item.title.length > 240 ||
        !httpsUrl(item.url) || !ids.has(item.sourceId) || !Number.isFinite(Date.parse(item.publishedAt))) {
      throw new Error("A news headline or source link is invalid.");
    }
  }
  return value;
}

export function newsForTrack(snapshot, track, now = Date.now()) {
  const sources = snapshot.sources.filter(source => source.tracks.includes(track));
  const ids = new Set(sources.map(source => source.id));
  const age = 30 * 86400000;
  const items = snapshot.items.filter(item => ids.has(item.sourceId) &&
    Date.parse(item.publishedAt) <= now + 300000 && Date.parse(item.publishedAt) >= now - age)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const stale = now - Date.parse(snapshot.generatedAt) > 36 * 3600000 || Date.parse(snapshot.generatedAt) > now + 300000;
  return { sources, items, stale };
}
