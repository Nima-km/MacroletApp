PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_food` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(250) NOT NULL,
	`nickname` text,
	`protein` integer NOT NULL,
	`fat` integer NOT NULL,
	`carbs` integer NOT NULL,
	`fiber` integer NOT NULL,
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
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_nickname_unique` ON `food` (`nickname`);--> statement-breakpoint
CREATE TABLE `__new_foodItem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	`food_id` integer NOT NULL,
	`servings` integer NOT NULL,
	`serving_mult` integer NOT NULL,
	`serving_type` text(20) NOT NULL,
	FOREIGN KEY (`food_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_foodItem`("id", "timestamp", "food_id", "servings", "serving_mult", "serving_type") SELECT "id", "timestamp", "food_id", "servings", "serving_mult", "serving_type" FROM `foodItem`;--> statement-breakpoint
DROP TABLE `foodItem`;--> statement-breakpoint
ALTER TABLE `__new_foodItem` RENAME TO `foodItem`;--> statement-breakpoint
CREATE TABLE `__new_IngredientItem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`recipe_id` integer NOT NULL,
	`ingredient_id` integer NOT NULL,
	`prep_notes` text(250),
	`display_name` text(20),
	`servings` integer NOT NULL,
	`serving_mult` integer NOT NULL,
	`serving_type` text(20) NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ingredient_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_IngredientItem`("id", "recipe_id", "ingredient_id", "prep_notes", "display_name", "servings", "serving_mult", "serving_type") SELECT "id", "recipe_id", "ingredient_id", "prep_notes", "display_name", "servings", "serving_mult", "serving_type" FROM `IngredientItem`;--> statement-breakpoint
DROP TABLE `IngredientItem`;--> statement-breakpoint
ALTER TABLE `__new_IngredientItem` RENAME TO `IngredientItem`;--> statement-breakpoint
CREATE TABLE `__new_macroSplit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(20) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_macroSplit`("id", "name") SELECT "id", "name" FROM `macroSplit`;--> statement-breakpoint
DROP TABLE `macroSplit`;--> statement-breakpoint
ALTER TABLE `__new_macroSplit` RENAME TO `macroSplit`;--> statement-breakpoint
CREATE TABLE `__new_recipe` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`servings_yield` integer DEFAULT 0 NOT NULL,
	`recipe_slug` text(50),
	`description` text(2000),
	`directions` text NOT NULL,
	`prep_time` integer DEFAULT 0 NOT NULL,
	`cook_time` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_recipe`("id", "servings_yield", "recipe_slug", "description", "directions", "prep_time", "cook_time") SELECT "id", "servings_yield", "recipe_slug", "description", "directions", "prep_time", "cook_time" FROM `recipe`;--> statement-breakpoint
DROP TABLE `recipe`;--> statement-breakpoint
ALTER TABLE `__new_recipe` RENAME TO `recipe`;--> statement-breakpoint
CREATE TABLE `__new_recipeBook` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(20) NOT NULL,
	`pictures` text
);
--> statement-breakpoint
INSERT INTO `__new_recipeBook`("id", "name", "pictures") SELECT "id", "name", "pictures" FROM `recipeBook`;--> statement-breakpoint
DROP TABLE `recipeBook`;--> statement-breakpoint
ALTER TABLE `__new_recipeBook` RENAME TO `recipeBook`;--> statement-breakpoint
CREATE TABLE `__new_servingSize` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`serving_mult` integer NOT NULL,
	`serving_type` text(20) NOT NULL,
	`food_id` integer NOT NULL,
	FOREIGN KEY (`food_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_servingSize`("id", "serving_mult", "serving_type", "food_id") SELECT "id", "serving_mult", "serving_type", "food_id" FROM `servingSize`;--> statement-breakpoint
DROP TABLE `servingSize`;--> statement-breakpoint
ALTER TABLE `__new_servingSize` RENAME TO `servingSize`;