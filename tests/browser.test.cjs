const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");

const baseURL = process.env.TEST_URL || "http://127.0.0.1:8765/";
const business = new URL(baseURL).searchParams.get("plan") === "business";
const key = business ? "level-up-club:business:v1" : "level-up-club:v1";
const taskSelector = (day, task) => `[data-task='${business ? "b" : "d"}${day}-t${task}']`;
const themedURL = theme => {
  const url = new URL(baseURL);
  url.searchParams.set("scoutTheme", theme);
  return url.href;
};
const text = (page, selector) => page.locator(selector).textContent();
const stored = page => page.evaluate(key => localStorage.getItem(key), key);
const file = content => ({ name: "backup.json", mimeType: "application/json", buffer: Buffer.from(content) });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: "America/Los_Angeles", acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-11-04T20:00:00Z") });
  try {
    await page.goto(baseURL);
    await page.waitForSelector(".task");
    assert.match(await text(page, "#calendar-status"), /Starts/);
    assert.match(await text(page, "#day-kicker"), /DAY 1 OF 28/);
    assert.match(await text(page, "#total-label"), /0 of 84/);

    if (business) {
      assert.match(await text(page, "#track-description"), /non-coding/);
      assert.match(await text(page, "#tasks"), /Business practice/);
    }
    await page.locator(taskSelector(1, 1)).check();
    assert.match(await text(page, "#total-label"), /1 of 84/);
    assert.equal(await page.locator("#total-progress").evaluate(element => element.value), 1);
    await page.locator("#notes").fill('Private test note <img src=x onerror="window.injected=true">');
    await page.reload();
    await page.waitForSelector(".task");
    assert.equal(await page.locator(taskSelector(1, 1)).isChecked(), true);
    assert.match(await page.locator("#notes").inputValue(), /Private test note/);
    assert.match(await text(page, "#storage-status"), /Saved on this device/);
    assert.equal(await page.evaluate(() => window.injected), undefined);
    console.log("PASS checkbox + notes persist after reload; real totals update; text remains inert");

    // Both dates straddle the US DST change on November 1.
    await page.locator("#start-date").fill("2026-10-31");
    await page.locator("#start-date").dispatchEvent("change");
    assert.match(await text(page, "#calendar-status"), /Day 5 of 28/);
    await page.locator("#go-current").click();
    assert.match(await text(page, "#day-kicker"), /DAY 5 OF 28/);
    assert.match(await text(page, "#day-date"), /Nov 4, 2026/);
    await page.locator("#weeks-tab").click();
    assert.equal(await page.locator(".day-link").count(), 28);
    assert.match(await page.locator(".week-header").first().textContent(), /1\/21 tasks/);
    await page.locator("[data-day='1']").click();
    assert.equal(await page.locator(taskSelector(1, 1)).isChecked(), true);
    await page.locator(taskSelector(1, 1)).uncheck();
    assert.match(await text(page, "#total-label"), /0 of 84/);
    await page.locator(taskSelector(1, 1)).check();
    await page.locator("#start-date").fill("2026-09-01");
    await page.locator("#start-date").dispatchEvent("change");
    assert.match(await text(page, "#calendar-status"), /calendar has ended/);
    await page.locator("#start-date").fill("2026-11-05");
    await page.locator("#start-date").dispatchEvent("change");
    console.log("PASS date changes, DST offset, past-day access, reopen task, and weekly totals");

    const snapshot = await stored(page);
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#export").click();
    const download = await downloadPromise;
    const downloaded = await fs.readFile(await download.path(), "utf8");
    assert.deepEqual(JSON.parse(downloaded), JSON.parse(snapshot));
    await page.locator("#notes").fill("Something different");
    page.once("dialog", dialog => dialog.accept());
    await page.locator("#import-file").setInputFiles(file(downloaded));
    await page.waitForFunction(() => document.getElementById("feedback").textContent.includes("imported and saved"));
    assert.equal(await stored(page), snapshot);
    await page.reload();
    await page.waitForSelector(".task");
    assert.equal(await stored(page), snapshot);
    console.log("PASS actual download + confirmed import roundtrip, including reload");

    const invalid = [
      "{", "null", JSON.stringify({ ...JSON.parse(snapshot), version: 3 }),
      JSON.stringify({ ...JSON.parse(snapshot), completed: ["not-a-task"] }),
      JSON.stringify({ ...JSON.parse(snapshot), notes: { 29: "invalid" } }),
      JSON.stringify({ ...JSON.parse(snapshot), startDate: "2026-02-30" }),
      " ".repeat(512 * 1024 + 1),
    ];
    for (const content of invalid) {
      await page.locator("#import-file").setInputFiles(file(content));
      await page.waitForFunction(() => document.getElementById("feedback").textContent.startsWith("Import rejected:"));
      await page.waitForFunction(() => !document.getElementById("import").disabled);
      assert.equal(await stored(page), snapshot);
      assert.match(await page.locator("#notes").inputValue(), /Private test note/);
    }
    page.once("dialog", dialog => dialog.dismiss());
    await page.locator("#import-file").setInputFiles(file(JSON.stringify({ version: 1, ...(business ? { plan: "business" } : {}), startDate: "2027-01-01", completed: [], notes: {} })));
    await page.waitForFunction(() => document.getElementById("feedback").textContent.startsWith("Import cancelled"));
    assert.equal(await stored(page), snapshot);
    console.log("PASS malformed, schema-invalid, oversized, and cancelled imports preserve state");

    const otherURL = new URL(baseURL);
    if (business) otherURL.searchParams.delete("plan");
    else otherURL.searchParams.set("plan", "business");
    const otherTrack = await context.newPage();
    await otherTrack.goto(otherURL.href);
    await otherTrack.waitForSelector(".task");
    assert.match(await text(otherTrack, "#total-label"), /0 of 84/);
    assert.equal(await otherTrack.locator("#notes").inputValue(), "");
    await otherTrack.locator("#import-file").setInputFiles(file(downloaded));
    await otherTrack.waitForFunction(() => document.getElementById("feedback").textContent.startsWith("Import rejected:"));
    await otherTrack.locator(".task input").first().check();
    assert.equal(await stored(page), snapshot);
    await otherTrack.close();
    console.log("PASS tracks have independent progress and reject each other's backups");

    for (let day = 1; day <= 28; day++) {
      await page.locator("#day-select").selectOption(String(day));
      assert.equal(await page.locator(".task-stack").count(), 3);
      for (const stack of await page.locator(".task-stack").all()) {
        assert.ok(await stack.locator(".daily-resources li").count() >= 2);
        for (const link of await stack.locator("a").all()) {
          assert.match(await link.getAttribute("href"), /^https:\/\//);
          assert.equal(await link.getAttribute("target"), "_blank");
        }
      }
    }
    await page.locator("#day-select").selectOption("1");
    const beforeStudy = await stored(page);
    await page.locator("#tasks button[data-resource]").first().click();
    assert.equal(await page.locator("#library-view").isVisible(), true);
    assert.equal(await page.locator("#resource-list > article").count(), 1);
    assert.equal(await page.locator("#resource-list .lesson-content").evaluate(node => node.open), true);
    assert.equal(await stored(page), beforeStudy);
    await page.locator("#resource-clear").click();
    await page.locator("#resource-kind").selectOption("Watch");
    assert.ok(await page.locator("#resource-list a").count() >= 2);
    await page.locator("#resource-search").fill("no-such-topic-1234");
    assert.equal(await page.locator("#resource-empty").isVisible(), true);
    await page.locator("#resource-clear").click();
    await page.locator("#resource-search").fill(business ? "Analytics lab" : "tiny LRU cache");
    await page.locator("#resource-list .lesson-content > summary").click();
    await page.locator("#resource-list .worked-check > summary").click();
    assert.match(await text(page, "#resource-list .worked-check"), business ? /6,000/ : /doubly linked list/);
    await page.locator("#resource-clear").click();
    await page.locator("#daily-tab").click();
    console.log("PASS all 84 tasks have study links; in-app lessons, worked checks, library search/type filters, and no progress side effects");

    await page.locator("#market-tab").click();
    await page.waitForFunction(() => !document.getElementById("news-refresh").disabled);
    assert.ok(await page.locator("#news-list article").count() > 0);
    assert.ok(await page.locator("#news-sources li").count() >= 3);
    if (business) assert.doesNotMatch(await text(page, "#news-sources"), /AWS Architecture|Martin Fowler/);
    else assert.doesNotMatch(await text(page, "#news-sources"), /Supply Chain Dive|Mint: Economy/);
    console.log("PASS actual dated news snapshot and role-specific sources");

    const newsContext = await browser.newContext();
    const newsPage = await newsContext.newPage();
    let mode = "fresh";
    const now = new Date();
    const newsSnapshot = () => ({
      version: 1, generatedAt: mode === "stale" ? new Date(now.getTime() - 72 * 3600000).toISOString() : now.toISOString(),
      sources: [{ id: "fixture", name: "Fixture source", type: "Test", lens: "Ask for evidence", site: "https://example.com", tracks: [business ? "business" : "sde"], status: mode === "partial" ? "error" : "ok", lastSuccessAt: mode === "partial" ? null : now.toISOString() }],
      items: [{ sourceId: "fixture", title: '<img src=x onerror="window.injected=true"> plain headline', url: "https://example.com/story", publishedAt: new Date(now.getTime() - 3600000).toISOString() }],
    });
    await newsPage.route("**/news.json", route => route.fulfill({
      status: mode === "offline" ? 503 : 200,
      contentType: "application/json",
      body: mode === "bad" ? '{"version":' : JSON.stringify(newsSnapshot()),
    }));
    await newsPage.goto(baseURL);
    await newsPage.locator("#market-tab").click();
    await newsPage.waitForFunction(() => !document.getElementById("news-refresh").disabled);
    assert.equal(await newsPage.locator("#news-list img").count(), 0);
    assert.equal(await newsPage.evaluate(() => window.injected), undefined);
    for (const nextMode of ["stale", "partial", "offline", "bad"]) {
      mode = nextMode;
      await newsPage.locator("#news-refresh").click();
      await newsPage.waitForFunction(() => !document.getElementById("news-refresh").disabled);
      assert.match(await text(newsPage, "#news-status"), nextMode === "stale" ? /stale/ : nextMode === "partial" ? /unavailable/ : /News unavailable/);
      assert.match(await text(newsPage, "#news-list"), /EARLIER SNAPSHOT/);
    }
    await newsContext.close();
    console.log("PASS news stale/partial/offline/malformed states and inert title rendering");
    await page.locator("#daily-tab").click();

    const cacheContext = await browser.newContext();
    const cachePage = await cacheContext.newPage();
    let legacyRequests = 0;
    await cachePage.route(/\/(?:app|core|catalog|plan|business-plan|study-content|study-ui|market)\.js$/, route => {
      legacyRequests++;
      return route.fulfill({ contentType: "application/javascript", body: 'throw new Error("Stale legacy module was requested");' });
    });
    await cachePage.goto(baseURL);
    await cachePage.waitForSelector(".task");
    assert.equal(legacyRequests, 0);
    assert.match(await text(cachePage, "#track-description"), business ? /non-coding/ : /Senior SDE/);
    await cacheContext.close();
    console.log("PASS complete module chain avoids stale unversioned assets");

    for (const theme of ["light", "dark"]) {
      for (const width of [360, 390, 768, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(themedURL(theme));
        await page.waitForSelector(".task");
        for (const view of ["daily", "weeks", "guide", "library", "market"]) {
          await page.locator(`#${view}-tab`).click();
          if (view === "market") await page.waitForFunction(() => !document.getElementById("news-refresh").disabled);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${theme}/${width}/${view} overflows`);
        }
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#daily-tab").click();
    await page.locator(taskSelector(1, 2)).focus();
    await page.keyboard.press("Space");
    assert.equal(await page.locator(taskSelector(1, 2)).isChecked(), true);
    assert.equal(await page.locator(taskSelector(1, 2)).evaluate(element => element === document.activeElement), true);
    await page.keyboard.press("Space");
    assert.equal(await page.locator(taskSelector(1, 2)).isChecked(), false);
    await page.keyboard.press("Tab");
    assert.match(await page.evaluate(() => document.activeElement.tagName), /^(A|BUTTON)$/);
    assert.equal(await page.evaluate(() => document.activeElement.closest(".task-stack").querySelector("input").dataset.task), `${business ? "b" : "d"}1-t2`);
    await page.goto(baseURL);
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement.className), "skip");
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => location.hash), "#main");
    console.log("PASS 360/390/768/1280px in both themes and all views; keyboard toggle, focus, and skip link");

    const failureContext = await browser.newContext();
    await failureContext.addInitScript(() => {
      Storage.prototype.setItem = function () { throw new DOMException("Test quota failure", "QuotaExceededError"); };
    });
    const failurePage = await failureContext.newPage();
    await failurePage.goto(baseURL);
    await failurePage.waitForSelector(".task");
    await failurePage.locator(".task input").first().check();
    assert.match(await text(failurePage, "#storage-status"), /Not saved/);
    assert.doesNotMatch(await text(failurePage, "#storage-status"), /Saved on this device/);
    assert.equal(await failurePage.locator(".task input").first().isChecked(), true);
    await failureContext.close();

    const corruptContext = await browser.newContext();
    await corruptContext.addInitScript(key => localStorage.setItem(key, "{bad json"), key);
    const corruptPage = await corruptContext.newPage();
    await corruptPage.goto(baseURL);
    await corruptPage.waitForSelector(".task");
    await corruptPage.locator(".task input").first().check();
    assert.match(await text(corruptPage, "#storage-status"), /Not saved/);
    assert.equal(await stored(corruptPage), "{bad json");
    await corruptContext.close();

    // A write failure after successful initialization must never display saved.
    await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error("Quota exceeded"); }; });
    await page.locator(".task input").first().uncheck();
    assert.match(await text(page, "#storage-status"), /Not saved: Quota exceeded/);
    await page.reload();
    await page.waitForSelector(".task");
    const otherTab = await context.newPage();
    await otherTab.goto(baseURL);
    await otherTab.waitForSelector(".task");
    await otherTab.locator(".task input").first().uncheck();
    await page.waitForFunction(() => document.getElementById("storage-status").textContent.includes("another tab"));
    const otherState = await stored(otherTab);
    await page.locator(".task input").nth(1).check();
    assert.equal(await stored(page), otherState);
    await otherTab.close();
    console.log("PASS unavailable storage, corrupt state preservation, failed writes, and cross-tab conflict protection");
    assert.deepEqual(errors, []);

    if (process.env.SCREENSHOT_PATH) {
      const cleanContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const cleanPage = await cleanContext.newPage();
      await cleanPage.goto(themedURL("light"));
      await cleanPage.waitForSelector(".task");
      await cleanPage.screenshot({ path: process.env.SCREENSHOT_PATH, fullPage: true });
      await cleanContext.close();
    }
    console.log(`All browser acceptance checks passed: ${baseURL}`);
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
