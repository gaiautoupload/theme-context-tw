import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const seed = JSON.parse(
  await readFile(new URL("../data/seed-data.json", import.meta.url), "utf8"),
);

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

function runtimeEnv(extra = {}) {
  return {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
    ...extra,
  };
}

function context() {
  return {
    waitUntil() {},
    passThroughOnException() {},
  };
}

test("server-renders the final research homepage", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    runtimeEnv(),
    context(),
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /題材脈絡/);
  assert.match(html, /先回答昨天為什麼跌/);
  assert.match(html, /國際事件/);
  assert.match(html, /投資主題/);
  assert.match(html, /台股一天跌/);
  assert.match(html, /2,030.83/);
  assert.match(html, /大人物一句話/);
  assert.match(html, /沒公布，就不先猜答案/);
  assert.match(html, /公司剛發布什麼/);
  assert.match(html, /川普伊朗口風一天轉硬/);
  assert.match(html, /FOMC 結果尚未公布/);
  assert.match(html, /市場震源之後，再看中線題材/);
  assert.match(html, /設定你要等的訊號/);
  assert.match(html, /先行分數 ≥ 80/);
  assert.match(html, /市場還沒燒起來，證據先冒煙/);
  assert.match(html, /小火苗/);
  assert.match(html, /FOPLP、CPO 與異質整合/);
  assert.match(html, /五分鐘，只看會影響判斷的事/);
  assert.match(html, /DRAM \+13～18%/);
  assert.match(html, /誰的關聯最直接/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/);
});

test("public APIs expose the current snapshot and search", async () => {
  const worker = await loadWorker();
  const latest = await worker.fetch(
    new Request("http://localhost/api/daily/latest"),
    runtimeEnv(),
    context(),
  );
  assert.equal(latest.status, 200);
  const report = await latest.json();
  assert.equal(report.run.id, seed.run.id);
  assert.equal(report.topThemes.length, seed.themes.length);
  assert.equal(report.marketSignals.length, seed.marketSignals.length);

  const search = await worker.fetch(
    new Request("http://localhost/api/search?q=台積電"),
    runtimeEnv(),
    context(),
  );
  assert.equal(search.status, 200);
  const results = await search.json();
  assert.ok(results.results.some((item) => item.id === "2330"));
});
