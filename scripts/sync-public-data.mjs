import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(filename) {
  if (!fs.existsSync(filename)) return;
  for (const line of fs.readFileSync(filename, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || match[2] === "") continue;
    if (!process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

loadEnv(path.join(root, ".env.local"));
const endpoint = process.env.PUBLIC_SYNC_URL;
const token = process.env.SYNC_TOKEN;
if (!endpoint || !token) {
  console.error("PUBLIC_SYNC_URL and SYNC_TOKEN are required in .env.local.");
  process.exit(1);
}

const candidate = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, "data", "daily-candidate.json");
const fallback = path.join(root, "data", "seed-data.json");
const filename = fs.existsSync(candidate) ? candidate : fallback;
const raw = fs.readFileSync(filename, "utf8");

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  },
  body: raw,
});
const body = await response.text();
if (!response.ok) {
  console.error(`Sync failed (${response.status}): ${body}`);
  process.exit(1);
}
console.log(`Synced ${path.relative(root, filename)}: ${body}`);
