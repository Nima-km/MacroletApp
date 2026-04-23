CREATE TABLE `weightItem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	`weight` integer NOT NULL,
	`unit` text(8) NOT NULL
);
