DROP INDEX `users_nickname_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `food_nickname_unique` ON `food` (`nickname`);