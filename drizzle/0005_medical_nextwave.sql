PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_foodItem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	`food_id` integer NOT NULL,
	`servings` integer NOT NULL,
	`serving_mult` integer NOT NULL,
	`serving_type` text NOT NULL,
	FOREIGN KEY (`food_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_foodItem`("id", "timestamp", "food_id", "servings", "serving_mult", "serving_type") SELECT "id", "timestamp", "food_id", "servings", "serving_mult", "serving_type" FROM `foodItem`;--> statement-breakpoint
DROP TABLE `foodItem`;--> statement-breakpoint
ALTER TABLE `__new_foodItem` RENAME TO `foodItem`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_IngredientItem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`recipe_id` integer NOT NULL,
	`ingredient_id` integer NOT NULL,
	`prep_notes` text,
	`display_name` text,
	`servings` integer NOT NULL,
	`serving_mult` integer NOT NULL,
	`serving_type` text NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ingredient_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_IngredientItem`("id", "recipe_id", "ingredient_id", "prep_notes", "display_name", "servings", "serving_mult", "serving_type") SELECT "id", "recipe_id", "ingredient_id", "prep_notes", "display_name", "servings", "serving_mult", "serving_type" FROM `IngredientItem`;--> statement-breakpoint
DROP TABLE `IngredientItem`;--> statement-breakpoint
ALTER TABLE `__new_IngredientItem` RENAME TO `IngredientItem`;--> statement-breakpoint
CREATE TABLE `__new_servingSize` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`serving_mult` integer NOT NULL,
	`serving_type` text NOT NULL,
	`food_id` integer NOT NULL,
	FOREIGN KEY (`food_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_servingSize`("id", "serving_mult", "serving_type", "food_id") SELECT "id", "serving_mult", "serving_type", "food_id" FROM `servingSize`;--> statement-breakpoint
DROP TABLE `servingSize`;--> statement-breakpoint
ALTER TABLE `__new_servingSize` RENAME TO `servingSize`;--> statement-breakpoint
ALTER TABLE `recipe` ADD `description` text;