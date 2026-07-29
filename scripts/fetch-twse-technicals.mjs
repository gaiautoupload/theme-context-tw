import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "data", "index-technical-input.json");
const requestedDate = process.argv[2] ?? new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

function monthStarts(isoDate, count = 14) {
  const [year, month] = isoDate.split("-").map(Number);
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(Date.UTC(year, month - 1 - offset, 1));
    return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}01`;
  }).reverse();
}

function rocToIso(value) {
  const [rocYear, month, day] = value.split("/").map(Number);
  return `${rocYear + 1911}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function number(value) {
  return Number(String(value).replaceAll(",", ""));
}

function average(rows, field, count) {
  const window = rows.slice(-count);
  return window.reduce((sum, row) => sum + row[field], 0) / window.length;
}

async function twse(pathname, monthStart) {
  const url = `https://www.twse.com.tw/rwd/zh/${pathname}?date=${monthStart}&response=json`;
  const response = await fetch(url, {
    headers: { "user-agent": "theme-context-tw-research/1.0" },
  });
  if (!response.ok) throw new Error(`TWSE ${response.status}: ${url}`);
  const payload = await response.json();
  if (payload.stat !== "OK") throw new Error(`TWSE returned ${payload.stat}: ${url}`);
  return { payload, url };
}

const priceRows = [];
const turnoverRows = [];
let priceSourceUrl = "";
let turnoverSourceUrl = "";

for (const monthStart of monthStarts(requestedDate)) {
  const [prices, turnover] = await Promise.all([
    twse("TAIEX/MI_5MINS_HIST", monthStart),
    twse("afterTrading/FMTQIK", monthStart),
  ]);
  priceSourceUrl = prices.url;
  turnoverSourceUrl = turnover.url;
  for (const row of prices.payload.data ?? []) {
    const date = rocToIso(row[0]);
    if (date <= requestedDate) {
      priceRows.push({
        date,
        open: number(row[1]),
        high: number(row[2]),
        low: number(row[3]),
        close: number(row[4]),
      });
    }
  }
  for (const row of turnover.payload.data ?? []) {
    const date = rocToIso(row[0]);
    if (date <= requestedDate) {
      turnoverRows.push({
        date,
        shares: number(row[1]),
        amount: number(row[2]),
        trades: number(row[3]),
        index: number(row[4]),
        changePoints: number(row[5]),
      });
    }
  }
}

const uniquePrices = [...new Map(priceRows.map((row) => [row.date, row])).values()]
  .sort((a, b) => a.date.localeCompare(b.date));
const uniqueTurnover = [...new Map(turnoverRows.map((row) => [row.date, row])).values()]
  .sort((a, b) => a.date.localeCompare(b.date));

if (uniquePrices.length < 240 || uniqueTurnover.length < 20) {
  throw new Error("Not enough official TWSE history to calculate technical inputs.");
}

const latestFormal = uniqueTurnover.at(-1);
const formalPrices = uniquePrices.filter((row) => row.date <= latestFormal.date);
const latestPrice = formalPrices.at(-1);
const previousPrice = formalPrices.at(-2);
const periods = [5, 10, 20, 60, 120, 240];
const movingAverages = periods.map((period) => ({
  period,
  value: Number(average(formalPrices, "close", period).toFixed(2)),
  position: latestPrice.close >= average(formalPrices, "close", period) ? "above" : "below",
}));
const latest20Prices = formalPrices.slice(-20);
const latest60Prices = formalPrices.slice(-60);
const average20Amount = average(uniqueTurnover, "amount", 20);

const result = {
  requestedDate,
  officialCloseDate: latestFormal.date,
  dataStatus: latestFormal.date === requestedDate ? "official_close" : "latest_official_close",
  symbol: "TWSE:IX0001",
  close: latestPrice.close,
  changePoints: Number((latestPrice.close - previousPrice.close).toFixed(2)),
  changePercent: Number((((latestPrice.close / previousPrice.close) - 1) * 100).toFixed(2)),
  open: latestPrice.open,
  high: latestPrice.high,
  low: latestPrice.low,
  turnoverBillionTwd: Number((latestFormal.amount / 1_000_000_000).toFixed(2)),
  turnoverRatio20: Number((latestFormal.amount / average20Amount).toFixed(2)),
  movingAverages,
  range20: {
    high: Math.max(...latest20Prices.map((row) => row.high)),
    low: Math.min(...latest20Prices.map((row) => row.low)),
  },
  range60: {
    high: Math.max(...latest60Prices.map((row) => row.high)),
    low: Math.min(...latest60Prices.map((row) => row.low)),
  },
  sources: {
    prices: priceSourceUrl,
    turnover: turnoverSourceUrl,
  },
};

await writeFile(output, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(`Wrote ${path.relative(root, output)} using official close ${latestFormal.date}.`);
