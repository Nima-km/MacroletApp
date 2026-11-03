import { db } from "@/db/client";
import { setting } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Key/value app preferences.
 *
 * A table rather than a store file because it has to survive reinstalls and be readable
 * before the first render — and it is a table because the app already ships migrations
 * for the database it lives in. No extra dependency for one string.
 */
export async function getSetting(key: string): Promise<string | null> {
	const rows = await db
		.select({ value: setting.value })
		.from(setting)
		.where(eq(setting.key, key))
		.limit(1);
	return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
	await db
		.insert(setting)
		.values({ key, value })
		.onConflictDoUpdate({ target: setting.key, set: { value } });
}
