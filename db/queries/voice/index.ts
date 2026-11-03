import { db } from "@/db/client";
import { food, foodItem } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

/**
 * Nicknames of the foods this device has logged most recently.
 *
 * Used to break ties the resolver cannot: every "chain, french fries" row scores
 * identically, so without a signal the user gets Denny's when they always log
 * McDonald's. The server has no food logs — they are local-only — so this boost has to
 * happen here.
 *
 * Nickname rather than id because candidates arrive from the server with *their* ids;
 * the nickname is the one key both sides share.
 */
export async function getRecentFoodNicknames(limit = 50): Promise<string[]> {
	const rows = await db
		.select({ nickname: food.nickname })
		.from(foodItem)
		.innerJoin(food, eq(food.id, foodItem.food_id))
		.orderBy(desc(foodItem.timestamp))
		.limit(limit);

	const seen = new Set<string>();
	const out: string[] = [];
	for (const row of rows) {
		const nickname = row.nickname;
		if (!nickname || seen.has(nickname)) continue;
		seen.add(nickname);
		out.push(nickname);
	}
	return out;
}
