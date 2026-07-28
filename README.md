# 題材脈絡

把全球事件轉換成「事件 → 主題 → 價值鏈 → 企業集團 → 台股」的可追溯研究地圖。網站不提供目標價或買賣建議；每項結論保留資料日期、信心、來源與推論類型。

首頁另有題材生命週期雷達，區分小火苗、擴散、火熱、降溫與衰敗。小火苗以「先行證據已聚合、但市場熱度仍低」為核心，不把已經熱門的題材重新包裝成早期發現。

## 本機開發

需求：Node.js 22.13+、Python 3。

```powershell
npm ci
npm run data:validate
python scripts/init_local_db.py
npm run dev
```

本機研究主庫位於 `data/research.sqlite`。它不進 Git；結構化公開快照位於 `data/seed-data.json`。

## 資料與部署

- `db/schema.ts`：Sites D1 與本機 SQLite 的共用資料模型。
- `scripts/init_local_db.py`：以交易方式寫入本機研究庫。
- `scripts/sync-public-data.mjs`：以 Bearer token 呼叫私有同步 API。
- `DAILY_RESEARCH.md`：工作日 18:30 的 Codex 固定研究與品質規則。
- `.env.local`：本機祕密；參考 `.env.example`，不納入版本控制。

公開唯讀 API：

- `GET /api/daily/latest`
- `GET /api/themes`
- `GET /api/themes/:slug`
- `GET /api/groups/:slug`
- `GET /api/stocks/:ticker`
- `GET /api/search?q=`

私有寫入介面為 `POST /api/admin/sync`。同一個 `run_id` 與相同內容可安全重跑；若內容不同則回傳 409。D1 批次交易失敗時，上一個 `published_snapshots` 仍會保留。

## 測試

```powershell
npm test
```

測試涵蓋資料完整性、頁面渲染、公開 API、同步授權與冪等／回滾語意。
