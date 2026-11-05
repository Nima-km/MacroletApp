CREATE TABLE `profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`height_cm` integer,
	`birth_year` integer,
	`sex` text(10),
	`activity` text(20),
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);

--> statement-breakpoint
-- Carry any profile already stored as settings into the new row, then drop the keys so
-- there is one source of truth. SQLite's column affinity converts the text values.
INSERT INTO `profile` (`id`, `height_cm`, `birth_year`, `sex`, `activity`)
SELECT
	1,
	(SELECT `value` FROM `setting` WHERE `key` = 'profile_height_cm'),
	(SELECT `value` FROM `setting` WHERE `key` = 'profile_birth_year'),
	(SELECT `value` FROM `setting` WHERE `key` = 'profile_sex'),
	(SELECT `value` FROM `setting` WHERE `key` = 'profile_activity')
WHERE EXISTS (
	SELECT 1 FROM `setting`
	WHERE `key` IN ('profile_height_cm', 'profile_birth_year', 'profile_sex', 'profile_activity')
);

--> statement-breakpoint
DELETE FROM `setting` WHERE `key` IN ('profile_height_cm', 'profile_birth_year', 'profile_sex', 'profile_activity');
