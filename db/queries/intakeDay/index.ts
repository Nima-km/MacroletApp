import { db } from "@/db/client";
import { intakeDayOverride } from "@/db/schema";
import { DayOverride } from "@/helper/intakeDays";
import { eq } from "drizzle-orm";

/** Every day the user has ruled on, as a map keyed by `YYYY-MM-DD`. */
export async function getIntakeDayOverrides(): Promise<Record<string, DayOverride>> {
	const rows = await db.select().from(intakeDayOverride);
	const map: Record<string, DayOverride> = {};
	for (const row of rows) {
		if (row.state === "include" || row.state === "exclude") {
			map[row.day] = row.state;
		}
	}
	return map;
}

/** Set or clear one day's decision. Passing null removes the override. */
export async function setIntakeDayOverride(
	day: string,
	state: DayOverride | null,
): Promise<void> {
	if (state === null) {
		await db.delete(intakeDayOverride).where(eq(intakeDayOverride.day, day));
		return;
	}
	await db
		.insert(intakeDayOverride)
		.values({ day, state })
		.onConflictDoUpdate({
			target: intakeDayOverride.day,
			set: { state },
		});
}
