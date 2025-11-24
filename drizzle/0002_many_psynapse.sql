CREATE TABLE `servingSize` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`serving_mult` integer DEFAULT 1 NOT NULL,
	`serving_type` text NOT NULL,
	`food_id` integer NOT NULL,
	FOREIGN KEY (`food_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_IngredientItem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`recipe_id` integer NOT NULL,
	`ingredient_id` integer NOT NULL,
	`servings` integer NOT NULL,
	`serving_mult` integer DEFAULT 1 NOT NULL,
	`serving_type` text NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ingredient_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_IngredientItem`("id", "recipe_id", "ingredient_id", "servings", "serving_mult", "serving_type") SELECT "id", "recipe_id", "ingredient_id", "servings", "serving_mult", "serving_type" FROM `IngredientItem`;--> statement-breakpoint
DROP TABLE `IngredientItem`;--> statement-breakpoint
ALTER TABLE `__new_IngredientItem` RENAME TO `IngredientItem`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_food` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`nickname` text,
	`protein` integer DEFAULT 0 NOT NULL,
	`fat` integer DEFAULT 0 NOT NULL,
	`carbs` integer DEFAULT 0 NOT NULL,
	`fiber` integer DEFAULT 0 NOT NULL,
	`barcode` integer DEFAULT 0,
	`serving_100g` integer DEFAULT 1 NOT NULL,
	`volume_100ml` integer DEFAULT 1 NOT NULL,
	`micro_nutriants` text,
	`recipe_id` integer,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_food`("id", "name", "nickname", "protein", "fat", "carbs", "fiber", "barcode", "serving_100g", "volume_100ml", "micro_nutriants", "recipe_id") SELECT "id", "name", "nickname", "protein", "fat", "carbs", "fiber", "barcode", "serving_100g", "volume_100ml", "micro_nutriants", "recipe_id" FROM `food`;--> statement-breakpoint
DROP TABLE `food`;--> statement-breakpoint
ALTER TABLE `__new_food` RENAME TO `food`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_nickname_unique` ON `food` (`nickname`);