import test from "node:test";
import assert from "node:assert/strict";
import { resources, resourcesForTrack, resourceById, dailyResources } from "../study-content.js";
import { httpsUrl, validateNews, newsForTrack } from "../market.js";

test("each of 168 tasks has at least two valid track-specific study resources", () => {
  assert.equal(resourceById.size, resources.length);
  for (const track of ["sde", "business"]) {
    const catalog = resourcesForTrack(track);
    assert.ok(catalog.some(resource => resource.kind === "Watch"));
    assert.ok(catalog.some(resource => resource.kind === "Problem"));
    assert.ok(catalog.some(resource => resource.answer));
    for (let day = 1; day <= 28; day++) {
      const tasks = dailyResources(track, day);
      assert.equal(tasks.length, 3);
      for (const ids of tasks) {
        assert.ok(ids.length >= 2);
        assert.equal(new Set(ids).size, ids.length);
        for (const id of ids) {
          const resource = resourceById.get(id);
          assert.ok(resource, `${track} day ${day}: ${id}`);
          assert.ok(resource.tracks.includes(track));
        }
      }
    }
  }
  assert.throws(() => dailyResources("business", 29));
  assert.throws(() => dailyResources("business", 0));
  assert.throws(() => dailyResources("invalid", 1));
});

test("external resources are HTTPS; in-app lessons contain actual study material", () => {
  for (const resource of resources) {
    assert.ok(resource.title && resource.summary && resource.access && resource.source);
    if (resource.url) assert.ok(httpsUrl(resource.url), resource.id);
    else {
      assert.ok(resource.sections.length >= 2);
      assert.ok(resource.sections.every(([heading, content]) => heading && content.length > 50));
    }
  }
  assert.equal(resourcesForTrack("sde").filter(resource => resource.source === "LeetCode").length, 31);
  assert.equal(resourcesForTrack("business").filter(resource => resource.source === "LeetCode").length, 0);
});

const now = Date.parse("2026-11-04T12:00:00Z");
function fixture() {
  return {
    version: 1, generatedAt: "2026-11-04T11:00:00Z",
    sources: [
      { id: "sde", name: "Engineering", type: "Company news", lens: "Think about tradeoffs", site: "https://example.com/", tracks: ["sde"], status: "ok", lastSuccessAt: "2026-11-04T11:00:00Z" },
      { id: "biz", name: "Business", type: "Reporting", lens: "Think about KPIs", site: "https://example.org/", tracks: ["business"], status: "error", lastSuccessAt: null },
    ],
    items: [
      { sourceId: "sde", title: "<img src=x onerror=alert(1)> is plain text", url: "https://example.com/story", publishedAt: "2026-11-03T12:00:00Z" },
      { sourceId: "biz", title: "Operations story", url: "https://example.org/story", publishedAt: "2026-11-04T10:00:00Z" },
      { sourceId: "sde", title: "Future story", url: "https://example.com/future", publishedAt: "2026-12-01T10:00:00Z" },
      { sourceId: "sde", title: "Old story", url: "https://example.com/old", publishedAt: "2026-09-01T10:00:00Z" },
    ],
  };
}

test("news has track isolation, publication windows, and honest snapshot freshness", () => {
  const value = validateNews(fixture());
  const sde = newsForTrack(value, "sde", now);
  assert.equal(sde.sources.length, 1);
  assert.equal(sde.items.length, 1);
  assert.equal(sde.stale, false);
  const business = newsForTrack(value, "business", now);
  assert.equal(business.items[0].title, "Operations story");
  assert.equal(business.sources[0].status, "error");
  assert.equal(newsForTrack({ ...value, generatedAt: "2026-11-01T11:00:00Z" }, "sde", now).stale, true);
  assert.equal(newsForTrack({ ...value, generatedAt: "2026-12-01T11:00:00Z" }, "sde", now).stale, true);
});

test("reject executable links, malformed news, duplicate sources, and invalid dates", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,test", "http://example.com", "https://user:pass@example.com", "not a URL"]) {
    assert.equal(httpsUrl(url), null);
  }
  for (const mutate of [
    value => { value.version = 2; },
    value => { value.generatedAt = "bad date"; },
    value => { value.sources.push(value.sources[0]); },
    value => { value.items[0].url = "javascript:alert(1)"; },
    value => { value.items[0].sourceId = "unknown"; },
    value => { value.items[0].publishedAt = "bad date"; },
    value => { value.sources[0].tracks = ["unknown"]; },
  ]) {
    const value = fixture();
    mutate(value);
    assert.throws(() => validateNews(value));
  }
});
