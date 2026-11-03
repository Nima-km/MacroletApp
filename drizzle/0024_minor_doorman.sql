CREATE TABLE `weightGoal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`target_weight` integer NOT NULL,
	`tolerance` integer,
	`target_date` integer,
	`started_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `weight_goal_created_at_idx` ON `weightGoal` (`created_at`);