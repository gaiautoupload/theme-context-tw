CREATE TABLE `material_signals` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`material` text NOT NULL,
	`direction` text NOT NULL,
	`change_label` text NOT NULL,
	`period` text NOT NULL,
	`status` text NOT NULL,
	`thesis` text NOT NULL,
	`source_ids` text NOT NULL,
	`theme_ids` text NOT NULL,
	`stock_links` text NOT NULL
);
