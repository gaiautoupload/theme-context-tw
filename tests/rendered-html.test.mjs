import assert from "node:assert/strict";
import test from "node:test";

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
  assert.match(html, /AI 主線沒有消失/);
  assert.match(html, /國際事件/);
  assert.match(html, /投資主題/);
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
  assert.equal(report.run.id, "2026-07-28-close-v1");
  assert.equal(report.topThemes.length, 5);

  const search = await worker.fetch(
    new Request("http://localhost/api/search?q=台積電"),
    runtimeEnv(),
    context(),
  );
  assert.equal(search.status, 200);
  const results = await search.json();
  assert.ok(results.results.some((item) => item.id === "2330"));
});
