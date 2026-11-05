CREATE TABLE `macroProfile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(40) NOT NULL,
	`preset` text(20),
	`active` integer DEFAULT 0 NOT NULL,
	`checkpoints` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
