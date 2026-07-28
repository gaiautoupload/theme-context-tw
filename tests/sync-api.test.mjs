import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const raw = await readFile(new URL("../data/seed-data.json", import.meta.url), "utf8");

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

class FakeD1 {
  constructor() {
    this.jobs = new Map();
    this.snapshots = new Map();
    this.failNextBatch = false;
  }

  prepare(sql) {
    const statement = {
      sql,
      args: [],
      bind(...args) {
        statement.args = args;
        return statement;
      },
      first: async () => {
        if (!sql.startsWith("SELECT content_hash")) return null;
        const job = this.jobs.get(statement.args[0]);
        return job ? { content_hash: job.hash, status: job.status } : null;
      },
    };
    return statement;
  }

  async batch(statements) {
    if (this.failNextBatch) {
      this.failNextBatch = false;
      throw new Error("simulated transaction failure");
    }
    const nextJobs = new Map(this.jobs);
    const nextSnapshots = new Map(this.snapshots);
    for (const statement of statements) {
      if (statement.sql.startsWith("INSERT INTO sync_jobs")) {
        nextJobs.set(statement.args[0], {
          hash: statement.args[1],
          status: "published",
        });
      }
      if (statement.sql.startsWith("INSERT INTO published_snapshots")) {
        nextSnapshots.set(statement.args[0], statement.args[2]);
      }
    }
    this.jobs = nextJobs;
    this.snapshots = nextSnapshots;
    return [];
  }
}

function env(db) {
  return {
    DB: db,
    SYNC_TOKEN: "test-secret",
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  };
}

const ctx = { waitUntil() {}, passThroughOnException() {} };

function request(body = raw, token = "test-secret") {
  return new Request("http://localhost/api/admin/sync", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body,
  });
}

test("sync requires authorization and is idempotent", async () => {
  const worker = await loadWorker();
  const db = new FakeD1();
  const unauthorized = await worker.fetch(request(raw, "wrong"), env(db), ctx);
  assert.equal(unauthorized.status, 401);
  assert.equal(db.snapshots.size, 0);

  const first = await worker.fetch(request(), env(db), ctx);
  assert.equal(first.status, 200);
  assert.equal((await first.json()).idempotent, false);
  assert.equal(db.snapshots.size, 1);

  const second = await worker.fetch(request(), env(db), ctx);
  assert.equal(second.status, 200);
  assert.equal((await second.json()).idempotent, true);
  assert.equal(db.snapshots.size, 1);
});

test("failed D1 batch leaves the previous snapshot untouched", async () => {
  const worker = await loadWorker();
  const db = new FakeD1();
  db.snapshots.set("previous-run", "previous-payload");
  db.failNextBatch = true;
  const response = await worker.fetch(request(), env(db), ctx);
  assert.equal(response.status, 500);
  assert.equal(db.snapshots.size, 1);
  assert.equal(db.snapshots.get("previous-run"), "previous-payload");
});
