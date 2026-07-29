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
  assert.match(html, /台股一天跌/);
  assert.match(html, /2,030.83/);
  assert.match(html, /川普伊朗口風一天轉硬/);
  assert.match(html, /FOMC 結果尚未公布/);
  assert.match(html, /不用一直往下滑/);
  assert.match(html, /即時震源/);
  assert.match(html, /大盤技術/);
  assert.match(html, /小火苗/);
  assert.match(html, /脈絡地圖/);
  assert.match(html, /FOPLP、CPO 與異質整合/);
  assert.match(html, /五分鐘，只看會影響判斷的事/);
  assert.match(html, /DRAM \+13～18%/);
  assert.match(html, /誰的關聯最直接/);
  assert.doesNotMatch(html, /id="market-shocks"/);
  assert.doesNotMatch(html, /id="market-technical"/);
  assert.doesNotMatch(html, /id="company-wire"/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/);
});

test("research detail is split across focused pages", async () => {
  const worker = await loadWorker();

  const marketResponse = await worker.fetch(
    new Request("http://localhost/market", { headers: { accept: "text/html" } }),
    runtimeEnv(),
    context(),
  );
  assert.equal(marketResponse.status, 200);
  const marketHtml = await marketResponse.text();
  assert.match(marketHtml, /誰剛說了什麼/);
  assert.match(marketHtml, /大人物一句話/);
  assert.match(marketHtml, /沒公布，就不先猜答案/);
  assert.match(marketHtml, /公司剛發布什麼/);

  const technicalResponse = await worker.fetch(
    new Request("http://localhost/technical", { headers: { accept: "text/html" } }),
    runtimeEnv(),
    context(),
  );
  assert.equal(technicalResponse.status, 200);
  const technicalHtml = await technicalResponse.text();
  assert.match(technicalHtml, /大盤技術線型推演/);
  assert.match(technicalHtml, /A 波急跌/);
  assert.match(technicalHtml, /B 波反彈/);
  assert.match(technicalHtml, /C 波再測/);
  assert.match(technicalHtml, /情境推演，不是命定劇本/);
  assert.match(technicalHtml, /43,714–44,081/);
  assert.match(technicalHtml, /半年線支撐/);

  const opportunityResponse = await worker.fetch(
    new Request("http://localhost/opportunities", { headers: { accept: "text/html" } }),
    runtimeEnv(),
    context(),
  );
  assert.equal(opportunityResponse.status, 200);
  const opportunityHtml = await opportunityResponse.text();
  assert.match(opportunityHtml, /市場震源之後，再看中線題材/);
  assert.match(opportunityHtml, /設定你要等的訊號/);
  assert.match(opportunityHtml, /先行分數 ≥ 80/);
  assert.match(opportunityHtml, /市場還沒燒起來，證據先冒煙/);

  const mapResponse = await worker.fetch(
    new Request("http://localhost/map", { headers: { accept: "text/html" } }),
    runtimeEnv(),
    context(),
  );
  assert.equal(mapResponse.status, 200);
  const mapHtml = await mapResponse.text();
  assert.match(mapHtml, /把整條因果鏈展開/);
  assert.match(mapHtml, /從事件一路追到台股/);
  assert.match(mapHtml, /把事實與推論分開看/);
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
  assert.equal(report.indexTechnicalAnalysis.id, seed.indexTechnicalAnalysis.id);

  const search = await worker.fetch(
    new Request("http://localhost/api/search?q=台積電"),
    runtimeEnv(),
    context(),
  );
  assert.equal(search.status, 200);
  const results = await search.json();
  assert.ok(results.results.some((item) => item.id === "2330"));
});
