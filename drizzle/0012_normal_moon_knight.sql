PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_food` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(250) NOT NULL,
	`nickname` text,
	`protein` integer NOT NULL,
	`fat` integer NOT NULL,
	`carbs` integer NOT NULL,
	`fiber` integer NOT NULL,
	`barcode` text DEFAULT '',
	`serving_100g` integer DEFAULT 0 NOT NULL,
	`volume_100ml` integer DEFAULT 0 NOT NULL,
	`micro_nutriants` text,
	`recipe_id` integer,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_food`("id", "name", "nickname", "protein", "fat", "carbs", "fiber", "barcode", "serving_100g", "volume_100ml", "micro_nutriants", "recipe_id") SELECT "id", "name", "nickname", "protein", "fat", "carbs", "fiber", "barcode", "serving_100g", "volume_100ml", "micro_nutriants", "recipe_id" FROM `food`;--> statement-breakpoint
DROP TABLE `food`;--> statement-breakpoint
ALTER TABLE `__new_food` RENAME TO `food`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_nickname_unique` ON `food` (`nickname`);