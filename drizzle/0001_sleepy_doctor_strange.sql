ALTER TABLE `themes` ADD `lifecycle` text DEFAULT 'spark' NOT NULL;--> statement-breakpoint
ALTER TABLE `themes` ADD `first_detected_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `themes` ADD `early_signal_score` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `themes` ADD `market_heat` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `themes` ADD `momentum` text DEFAULT 'stable' NOT NULL;--> statement-breakpoint
ALTER TABLE `themes` ADD `spark_signals` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `themes` ADD `spread_triggers` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `themes` ADD `invalidation_signals` text DEFAULT '[]' NOT NULL;