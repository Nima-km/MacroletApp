ALTER TABLE `macroProfile` RENAME TO `macroSplit`;--> statement-breakpoint
ALTER TABLE `recipeItem` RENAME TO `recipeBookItem`;--> statement-breakpoint
CREATE TABLE `IngredientItem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`recipe_id` integer NOT NULL,
	`food_id` integer NOT NULL,
	`servings` integer NOT NULL,
	`serving_mult` integer DEFAULT 1 NOT NULL,
	`serving_type` text NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`food_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recipeBook` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`pictures` text
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipeBookItem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`recipe_id` integer NOT NULL,
	`recipeBook_id` integer NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipeBook_id`) REFERENCES `recipeBook`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_recipeBookItem`("id", "recipe_id", "recipeBook_id") SELECT "id", "recipe_id", "recipeBook_id" FROM `recipeBookItem`;--> statement-breakpoint
DROP TABLE `recipeBookItem`;--> statement-breakpoint
ALTER TABLE `__new_recipeBookItem` RENAME TO `recipeBookItem`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_macroGoal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`protein` integer DEFAULT 0 NOT NULL,
	`fat` integer DEFAULT 0 NOT NULL,
	`carbs` integer DEFAULT 0 NOT NULL,
	`calories` integer DEFAULT 0 NOT NULL,
	`macro_profile` integer NOT NULL,
	FOREIGN KEY (`macro_profile`) REFERENCES `macroSplit`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_macroGoal`("id", "protein", "fat", "carbs", "calories", "macro_profile") SELECT "id", "protein", "fat", "carbs", "calories", "macro_profile" FROM `macroGoal`;--> statement-breakpoint
DROP TABLE `macroGoal`;--> statement-breakpoint
ALTER TABLE `__new_macroGoal` RENAME TO `macroGoal`;--> statement-breakpoint
ALTER TABLE `food` ADD `recipe_id` integer REFERENCES recipe(id);--> statement-breakpoint
ALTER TABLE `food` DROP COLUMN `is_recipe`;