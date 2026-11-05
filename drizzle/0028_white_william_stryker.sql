CREATE TABLE `intakeDayOverride` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day` text(10) NOT NULL,
	`state` text(10) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `intakeDayOverride_day_unique` ON `intakeDayOverride` (`day`);