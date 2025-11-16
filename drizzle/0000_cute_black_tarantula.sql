CREATE TABLE `food` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`nickname` text NOT NULL,
	`protein` integer DEFAULT 0 NOT NULL,
	`fat` integer DEFAULT 0 NOT NULL,
	`carbs` integer DEFAULT 0 NOT NULL,
	`fiber` integer DEFAULT 0 NOT NULL,
	`barcode` integer DEFAULT 0,
	`serving_100g` integer DEFAULT 1 NOT NULL,
	`volume_100ml` integer DEFAULT 1 NOT NULL,
	`micro_nutriants` text,
	`is_recipe` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `foodItem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	`food_id` integer NOT NULL,
	`servings` integer DEFAULT 0 NOT NULL,
	`serving_mult` integer DEFAULT 1 NOT NULL,
	`serving_type` text NOT NULL,
	FOREIGN KEY (`food_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `macroGoal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`protein` integer DEFAULT 0 NOT NULL,
	`fat` integer DEFAULT 0 NOT NULL,
	`carbs` integer DEFAULT 0 NOT NULL,
	`calories` integer DEFAULT 0 NOT NULL,
	`macro_profile` integer NOT NULL,
	FOREIGN KEY (`macro_profile`) REFERENCES `macroProfile`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `macroProfile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nutritionGoal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` text DEFAULT (current_timestamp) NOT NULL,
	`protein` integer DEFAULT 0 NOT NULL,
	`fat` integer DEFAULT 0 NOT NULL,
	`calories` integer DEFAULT 0 NOT NULL,
	`carbs` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipe` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`servings_yield` integer DEFAULT 0 NOT NULL,
	`directions` text,
	`prep_time` integer DEFAULT 0 NOT NULL,
	`cook_time` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipeItem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`recipe_id` integer NOT NULL,
	`food_id` integer NOT NULL,
	`servings` integer NOT NULL,
	`serving_mult` integer DEFAULT 1 NOT NULL,
	`serving_type` text NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`food_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
