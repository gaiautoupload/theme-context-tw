CREATE TABLE `claims` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`statement` text NOT NULL,
	`confidence` text NOT NULL,
	`source_type` text NOT NULL,
	`source_ids` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`ticker` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`name` text NOT NULL,
	`industry` text NOT NULL,
	`role` text NOT NULL,
	`group_id` text,
	`summary` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `corporate_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`focus` text NOT NULL,
	`source_ids` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`title` text NOT NULL,
	`eyebrow` text NOT NULL,
	`narrative` text NOT NULL,
	`changes` text NOT NULL,
	`signals` text NOT NULL,
	`risks` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`region` text NOT NULL,
	`happened_at` text NOT NULL,
	`impact` text NOT NULL,
	`source_ids` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `group_memberships` (
	`run_id` text NOT NULL,
	`group_id` text NOT NULL,
	`ticker` text NOT NULL,
	`relation` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `group_membership_run_group_ticker` ON `group_memberships` (`run_id`,`group_id`,`ticker`);--> statement-breakpoint
CREATE TABLE `published_snapshots` (
	`run_id` text PRIMARY KEY NOT NULL,
	`content_hash` text NOT NULL,
	`payload` text NOT NULL,
	`published_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `research_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`as_of` text NOT NULL,
	`status` text NOT NULL,
	`content_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`published_at` text
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`title` text NOT NULL,
	`publisher` text NOT NULL,
	`url` text NOT NULL,
	`published_at` text NOT NULL,
	`retrieved_at` text NOT NULL,
	`source_type` text NOT NULL,
	`quality` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_jobs` (
	`run_id` text PRIMARY KEY NOT NULL,
	`content_hash` text NOT NULL,
	`status` text NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text,
	`error_message` text
);
--> statement-breakpoint
CREATE TABLE `theme_company_links` (
	`run_id` text NOT NULL,
	`theme_id` text NOT NULL,
	`ticker` text NOT NULL,
	`relevance` integer NOT NULL,
	`role` text NOT NULL,
	`stance` text NOT NULL,
	`reasoning` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `theme_company_run_theme_ticker` ON `theme_company_links` (`run_id`,`theme_id`,`ticker`);--> statement-breakpoint
CREATE TABLE `themes` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`name` text NOT NULL,
	`kicker` text NOT NULL,
	`score` integer NOT NULL,
	`stage` text NOT NULL,
	`direction` text NOT NULL,
	`thesis` text NOT NULL,
	`why_now` text NOT NULL,
	`value_capture` text NOT NULL,
	`chain` text NOT NULL,
	`catalysts` text NOT NULL,
	`risks` text NOT NULL,
	`source_ids` text NOT NULL
);
