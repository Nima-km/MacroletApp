PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipe` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`servings_yield` integer DEFAULT 0 NOT NULL,
	`recipe_slug` text(50),
	`description` text(250),
	`note` text(2000),
	`directions` text,
	`bannerImage` text,
	`tags` text,
	`prep_time` integer DEFAULT 0 NOT NULL,
	`cook_time` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_recipe`("id", "servings_yield", "recipe_slug", "description", "note", "directions", "bannerImage", "tags", "prep_time", "cook_time") SELECT "id", "servings_yield", "recipe_slug", "description", "note", "directions", "bannerImage", "tags", "prep_time", "cook_time" FROM `recipe`;--> statement-breakpoint
DROP TABLE `recipe`;--> statement-breakpoint
ALTER TABLE `__new_recipe` RENAME TO `recipe`;--> statement-breakpoint
PRAGMA foreign_keys=ON;