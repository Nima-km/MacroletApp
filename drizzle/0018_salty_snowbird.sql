CREATE INDEX `food_item_food_id_timestamp_idx` ON `foodItem` (`food_id`,`timestamp`);--> statement-breakpoint
CREATE INDEX `food_item_timestamp_idx` ON `foodItem` (`timestamp`);