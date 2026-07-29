CREATE TABLE `market_signals` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`kind` text NOT NULL,
	`headline` text NOT NULL,
	`actor` text NOT NULL,
	`quote` text,
	`occurred_at` text NOT NULL,
	`freshness` text NOT NULL,
	`severity` text NOT NULL,
	`direction` text NOT NULL,
	`status` text NOT NULL,
	`market_move` text NOT NULL,
	`why_it_matters` text NOT NULL,
	`affected_theme_ids` text NOT NULL,
	`affected_tickers` text NOT NULL,
	`next_watch` text NOT NULL,
	`source_ids` text NOT NULL
);
